using Dapper;
using ImportExportApi.Models;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ImportExportApi.Repositories
{
    public class LoanRepository : ILoanRepository
    {
        private readonly IDbConnection _db;
        private readonly ILogger<LoanRepository> _logger;

        public LoanRepository(IDbConnection db, ILogger<LoanRepository> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<int> BulkInsertAsync(IEnumerable<LoanDto> loans)
        {
            if (loans == null || !loans.Any()) return 0;

            const string sql = @"
                INSERT INTO dbo.Loans (LoanID, AccountNumber, CustomerName, LoanType, LoanAmount, InterestRate, Branch)
                VALUES (@LoanID, @AccountNumber, @CustomerName, @LoanType, @LoanAmount, @InterestRate, @Branch);
            ";

            try
            {
                _logger.LogInformation($"Attempting to insert {loans.Count()} loan records");
                var rows = await _db.ExecuteAsync(sql, loans);
                _logger.LogInformation($"Successfully inserted {rows} loan records");
                return rows;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error inserting loans: {ex.Message}\nStackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> CheckDuplicateAsync(string loanId)
        {
            try
            {
                _logger.LogInformation($"Checking for duplicate LoanID: {loanId}");
                const string sql = "SELECT COUNT(*) FROM dbo.Loans WHERE LoanID = @LoanID";
                var count = await _db.QuerySingleAsync<int>(sql, new { LoanID = loanId });
                _logger.LogInformation($"Duplicate check for {loanId}: Found {count} records");
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error checking duplicate: {ex.Message}");
                throw;
            }
        }

        public async Task<List<string>> GetExistingLoanIdsAsync(IEnumerable<string> loanIds)
        {
            if (loanIds == null || !loanIds.Any())
            {
                return new List<string>();
            }

            try
            {
                const string sql = "SELECT LoanID FROM dbo.Loans WHERE LoanID IN @LoanIds";
                var ids = (await _db.QueryAsync<string>(sql, new { LoanIds = loanIds })).ToList();
                _logger.LogInformation($"Found {ids.Count} existing loan IDs out of {loanIds.Count()} requested");
                return ids;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving existing loan IDs: {ex.Message}");
                throw;
            }
        }

        public async Task<List<LoanDto>> GetAllLoansAsync()
        {
            try
            {
                const string sql = @"
                    SELECT LoanID, AccountNumber, CustomerName, LoanType, LoanAmount, InterestRate, Branch
                    FROM dbo.Loans
                    ORDER BY LoanID";
                var loans = await _db.QueryAsync<LoanDto>(sql);
                return loans.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving loans: {ex.Message}");
                throw;
            }
        }

        public async Task<LoanDto> GetLoanByIdAsync(string loanId)
        {
            try
            {
                const string sql = "SELECT * FROM dbo.Loans WHERE LoanID = @LoanID";
                var loan = await _db.QuerySingleOrDefaultAsync<LoanDto>(sql, new { LoanID = loanId });
                return loan;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving loan: {ex.Message}");
                throw;
            }
        }
    }
}
