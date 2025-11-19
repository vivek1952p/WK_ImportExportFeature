using ImportExportApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ImportExportApi.Services
{
    public interface IImportService
    {
        Task<int> ImportJsonAsync(string fileName, string jsonContent);
        Task<int> ImportFromObjectsAsync(IEnumerable<LoanDto> loans);
    }
}
