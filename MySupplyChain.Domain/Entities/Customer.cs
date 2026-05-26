namespace MySupplyChain.Domain.Entities;

public class Customer : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
