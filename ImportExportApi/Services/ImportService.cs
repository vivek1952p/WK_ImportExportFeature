using ImportExportApi.Models;
using ImportExportApi.Repositories;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace ImportExportApi.Services
{
    public interface IImportService
    {
        Task<int> ImportJsonAsync(string fileName, string jsonContent);
        Task<int> ImportFromObjectsAsync(IEnumerable<LoanDto> loans);
    }

    public class ImportService : IImportService
    {
        private readonly ILoanRepository _loanRepository;
        private readonly ILogger<ImportService> _logger;

        public ImportService(ILoanRepository loanRepository, ILogger<ImportService> logger)
        {
            _loanRepository = loanRepository;
            _logger = logger;
        }

        // Accepts raw JSON string (file content), parses to LoanDto list and inserts
        public async Task<int> ImportJsonAsync(string fileName, string jsonContent)
        {
            if (string.IsNullOrWhiteSpace(jsonContent))
            {
                _logger.LogWarning("Empty JSON content received");
                return 0;
            }

            List<LoanDto> loans;
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                loans = JsonSerializer.Deserialize<List<LoanDto>>(jsonContent, options);
                _logger.LogInformation($"Successfully parsed {loans?.Count} records from JSON file: {fileName}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"JSON parsing error for file {fileName}: {ex.Message}\nContent: {jsonContent.Substring(0, Math.Min(200, jsonContent.Length))}");
                throw new InvalidOperationException("Invalid JSON format", ex);
            }

            if (loans == null || loans.Count == 0)
            {
                _logger.LogWarning("No loans found in parsed JSON");
                return 0;
            }

            // Validate loans
            foreach (var loan in loans)
            {
                if (string.IsNullOrWhiteSpace(loan.LoanID))
                {
                    _logger.LogError("Found loan with empty LoanID");
                    throw new InvalidOperationException("LoanID is required for all records");
                }
            }

            _logger.LogInformation($"All {loans.Count} loans validated successfully");

            // Check for duplicates
            var duplicates = new List<string>();
            foreach (var loan in loans)
            {
                try
                {
                    var exists = await _loanRepository.CheckDuplicateAsync(loan.LoanID);
                    if (exists)
                    {
                        duplicates.Add(loan.LoanID);
                        _logger.LogWarning($"Duplicate LoanID found: {loan.LoanID}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Could not check duplicate for {loan.LoanID}, assuming new record: {ex.Message}");
                    // Continue anyway - might be first insertion
                }
            }

            if (duplicates.Any())
            {
                throw new InvalidOperationException($"Duplicate LoanIDs found: {string.Join(", ", duplicates)}");
            }

            _logger.LogInformation($"No duplicates found, proceeding to insert {loans.Count} records");
            
            try
            {
                var inserted = await _loanRepository.BulkInsertAsync(loans);
                _logger.LogInformation($"Successfully inserted {inserted} loan records from file: {fileName}");
                return inserted;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during bulk insert: {ex.Message}\nStackTrace: {ex.StackTrace}");
                throw;
            }
        }

        // Directly accept objects
        public async Task<int> ImportFromObjectsAsync(IEnumerable<LoanDto> loans)
        {
            return await _loanRepository.BulkInsertAsync(loans);
        }
    }
}
