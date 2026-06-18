namespace MySupplyChain.Domain.Entities;

using Enums;

/// <summary>
/// Represents a proactive reorder decision made by the AI system
/// </summary>
public class ReorderRequest : EntityBase
{
    public int ProductId { get; set; } 
    public Product? Product { get; set; }

    public int QuantityToOrder { get; set; }
    public decimal PredictedDemand { get; set; }
    public DateTime RequestedAt { get; set; }
    public Status Status { get; set; } // e.g., "Pending", "Approved", "Completed"
    public string? Justification { get; set; } // AI reasoning for the reorder

    // ── Supplier Lead Time Tracking ───────────────────────────────────────────

    /// <summary>Optional FK to the Supplier fulfilling this reorder.</summary>
    public Guid? SupplierId { get; set; }

    /// <summary>Navigation property to the assigned Supplier.</summary>
    public Supplier? Supplier { get; set; }
}
