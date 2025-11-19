using ImportExportApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ImportExportApi.Repositories
{
    public interface ILoanRepository
    {
        Task<int> BulkInsertAsync(IEnumerable<LoanDto> loans);
        Task<bool> CheckDuplicateAsync(string loanId);
        Task<List<string>> GetExistingLoanIdsAsync(IEnumerable<string> loanIds);
        Task<List<LoanDto>> GetAllLoansAsync();
        Task<LoanDto> GetLoanByIdAsync(string loanId);
    }
}
