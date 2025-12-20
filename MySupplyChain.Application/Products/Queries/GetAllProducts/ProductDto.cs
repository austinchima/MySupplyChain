namespace MySupplyChain.Application.Products.Queries.GetAllProducts;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int ReorderPoint { get; set; }
    public decimal Price { get; set; }
    public string HealthStatus { get; set; } = "Healthy"; // Simple computed status for now
}
