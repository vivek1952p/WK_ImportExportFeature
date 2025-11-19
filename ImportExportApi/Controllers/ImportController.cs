using Microsoft.AspNetCore.Mvc;
using ImportExportApi.Services;
using Azure.Storage;
using Azure.Storage.Blobs;
using System.IO;
using System.Threading.Tasks;

namespace ImportExportApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly IImportService _importService;
        private readonly IConfiguration _config;
        private readonly ILogger<ImportController> _logger;

        public ImportController(IImportService importService, IConfiguration config, ILogger<ImportController> logger)
        {
            _importService = importService;
            _config = config;
            _logger = logger;
        }

        // Upload file - Complete 7-step workflow
        // 1️⃣ User uploads JSON
        // 2️⃣ API uploads JSON → Azure Blob Storage
        // 3️⃣ API reads JSON content
        // 4️⃣ API parses JSON into objects
        // 5️⃣ API inserts rows into SQL using Dapper
        // 6️⃣ API returns success
        // 7️⃣ Frontend loads: File history → Blob, Loan data → SQL
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "File is missing" });

                if (!file.FileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { error = "Only JSON files are allowed" });

                _logger.LogInformation($"Starting upload process for file: {file.FileName}");

                // Step 1-2: Read and upload to Azure Blob Storage
                string blobPath;
                using (var stream = file.OpenReadStream())
                {
                    blobPath = await UploadToBlobAsync(stream, file.FileName);
                }

                _logger.LogInformation($"File uploaded to Azure Blob: {blobPath}");

                // Step 3-5: Read, parse JSON and insert to SQL
                int insertedRows;
                using (var sr = new StreamReader(file.OpenReadStream()))
                {
                    var content = await sr.ReadToEndAsync();
                    _logger.LogInformation($"Read JSON content: {content.Length} bytes");
                    insertedRows = await _importService.ImportJsonAsync(file.FileName, content);
                }

                _logger.LogInformation($"Successfully inserted {insertedRows} rows");

                // Step 6: Return success
                return Ok(new
                {
                    success = true,
                    message = $"Successfully imported {insertedRows} records",
                    fileName = file.FileName,
                    blobPath = blobPath,
                    insertedRows = insertedRows
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during import: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Helper: Upload to Azure Blob Storage
        private async Task<string> UploadToBlobAsync(Stream stream, string fileName)
        {
            try
            {
                string accountName = _config["Azure:StorageAccountName"];
                string accountKey = _config["Azure:StorageAccountKey"];
                string containerName = _config["Azure:Container"];

                if (string.IsNullOrEmpty(accountName) || string.IsNullOrEmpty(accountKey))
                    throw new Exception("Azure storage credentials not configured");

                var blobUri = new Uri($"https://{accountName}.blob.core.windows.net/{containerName}");
                var credential = new StorageSharedKeyCredential(accountName, accountKey);
                var blobContainerClient = new BlobContainerClient(blobUri, credential);

                string blobPath = $"imports/{DateTime.UtcNow:yyyyMMdd_HHmmss}_{fileName}";
                var blobClient = blobContainerClient.GetBlobClient(blobPath);
                
                stream.Position = 0;
                await blobClient.UploadAsync(stream, overwrite: true);

                _logger.LogInformation($"Blob uploaded successfully: {blobPath}");
                return blobPath;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading to blob: {ex.Message}");
                throw;
            }
        }
    }
}
