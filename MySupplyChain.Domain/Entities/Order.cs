using MySupplyChain.Domain.Enums;

namespace MySupplyChain.Domain.Entities;

/// <summary>
/// Represents a customer order aggregate in the transaction system.
/// Tracks purchase details, dates, overall transaction totals, and full line-item details.
/// </summary>
public class Order : EntityBase
{
    /// <summary>
    /// Gets or sets the unique transaction/order tracking number (e.g. alphanumeric code).
    /// </summary>
    public string OrderNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the unique foreign key identifier for the purchasing Customer.
    /// </summary>
    public int CustomerId { get; set; }

    /// <summary>
    /// Gets or sets the point in time when this order was placed.
    /// </summary>
    public DateTime OrderDate { get; set; }

    /// <summary>
    /// Gets or sets the current processing status of the order (e.g., Pending, Shipped, Cancelled).
    /// </summary>
    public OrderStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the calculated total monetary sum of the order (inclusive of all order line items).
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Gets or sets the associated Customer entity who placed this order.
    /// </summary>
    public Customer? Customer { get; set; } = null!;

    /// <summary>
    /// Gets or sets the collection of individual line items purchased within this transaction.
    /// </summary>
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
