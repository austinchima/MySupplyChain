namespace MySupplyChain.Domain.Entities
{
    public class Product : EntityBase
    {
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int ReorderPoint { get; set; }
        public decimal Price { get; set; }

        // Navigation property
        public List<SalesHistory> SalesHistory { get; set; } = new();
    }
}
