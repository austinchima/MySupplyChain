namespace MySupplyChain.Domain.Entities
{
    public class SalesHistory : EntityBase
    {
        public int ProductId { get; set; }
        public string Sku { get; set; } = string.Empty; // Denormalized for ML training efficiency
        public DateTime Date { get; set; }
        public int QuantitySold { get; set; }
        public string? AdditionalData { get; set; }

        public Product Product { get; set; } = null!;
    }
}