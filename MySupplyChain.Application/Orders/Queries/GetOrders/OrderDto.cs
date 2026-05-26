namespace MySupplyChain.Application.Orders.Queries.GetOrders;

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public int Items { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Total { get; set; } = string.Empty;
}
