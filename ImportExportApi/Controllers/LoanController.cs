using Microsoft.AspNetCore.Mvc;
using ImportExportApi.Models;
using ImportExportApi.Repositories;

namespace ImportExportApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoanController : ControllerBase
    {
        private readonly ILoanRepository _loanRepository;
        private readonly ILogger<LoanController> _logger;

        public LoanController(ILoanRepository loanRepository, ILogger<LoanController> logger)
        {
            _loanRepository = loanRepository;
            _logger = logger;
        }

        // Get all loans from SQL
        [HttpGet("all")]
        public async Task<IActionResult> GetAllLoans()
        {
            try
            {
                var loans = await _loanRepository.GetAllLoansAsync();
                _logger.LogInformation($"Retrieved {loans.Count} loans from database");
                
                return Ok(new
                {
                    success = true,
                    data = loans,
                    count = loans.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving loans: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Get specific loan by ID
        [HttpGet("{loanId}")]
        public async Task<IActionResult> GetLoanById(string loanId)
        {
            try
            {
                var loan = await _loanRepository.GetLoanByIdAsync(loanId);
                if (loan == null)
                    return NotFound(new { error = $"Loan not found: {loanId}" });

                return Ok(new
                {
                    success = true,
                    data = loan
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving loan: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Check if LoanID exists (duplicate check)
        [HttpPost("check-duplicate")]
        public async Task<IActionResult> CheckDuplicate([FromBody] CheckDuplicateRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.LoanId))
                    return BadRequest(new { error = "LoanId is required" });

                var exists = await _loanRepository.CheckDuplicateAsync(request.LoanId);
                
                return Ok(new
                {
                    success = true,
                    exists = exists,
                    loanId = request.LoanId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error checking duplicate: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class CheckDuplicateRequest
    {
        public string LoanId { get; set; }
    }
}
