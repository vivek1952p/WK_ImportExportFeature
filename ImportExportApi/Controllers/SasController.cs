using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Mvc;

namespace ImportExportApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SasController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SasController> _logger;

        public SasController(IConfiguration config, ILogger<SasController> logger)
        {
            _config = config;
            _logger = logger;
        }

        [HttpPost("generate-upload-sas")]
        public IActionResult GenerateUploadSas([FromBody] SasRequest req)
        {
            try
            {
                _logger.LogInformation($"Generating SAS URL for file: {req.FileName}");
                
                string accountName = _config["Azure:StorageAccountName"];
                string accountKey = _config["Azure:StorageAccountKey"];
                string containerName = _config["Azure:Container"];

                if (string.IsNullOrEmpty(accountName) || string.IsNullOrEmpty(accountKey))
                {
                    _logger.LogError("Storage account credentials not configured");
                    return BadRequest("Storage account not configured");
                }

                _logger.LogInformation($"Using storage account: {accountName}, container: {containerName}");

                var credential = new StorageSharedKeyCredential(accountName, accountKey);

                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = containerName,
                    BlobName = req.FileName,
                    Resource = "b",
                    ExpiresOn = DateTime.UtcNow.AddMinutes(10)
                };

                sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

                var sasToken = sasBuilder.ToSasQueryParameters(credential).ToString();
                var blobUrl = $"https://{accountName}.blob.core.windows.net/{containerName}/{req.FileName}?{sasToken}";

                _logger.LogInformation($"SAS URL generated successfully for blob: {req.FileName}");

                return Ok(new { uploadUrl = blobUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating SAS URL: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class SasRequest
    {
        public string FileName { get; set; }
    }
}
