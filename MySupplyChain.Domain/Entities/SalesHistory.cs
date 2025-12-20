namespace MySupplyChain.Domain.Entities
{
    public class SalesHistory : EntityBase
    {
        public int ProductId { get; set; }
        public DateTime Date { get; set; }
        public int QuantitySold { get; set; }

        public Product Product { get; set; } = null!;
    }
}