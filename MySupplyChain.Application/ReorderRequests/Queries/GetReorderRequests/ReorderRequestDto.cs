namespace MySupplyChain.Application.ReorderRequests.Queries.GetReorderRequests;

public class ReorderRequestDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantityToOrder { get; set; }
    public decimal PredictedDemand { get; set; }
    public DateTime RequestedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Justification { get; set; }
}
