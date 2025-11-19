namespace ImportExportApi.Models
{
    public class LoanDto
    {
        public string LoanID { get; set; }
        public string AccountNumber { get; set; }
        public string CustomerName { get; set; }
        public string LoanType { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal InterestRate { get; set; }
        public string Branch { get; set; }
    }
}
