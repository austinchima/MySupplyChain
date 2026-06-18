namespace MySupplyChain.Domain.Entities;

/// <summary>
/// Represents a supplier in the supply chain.
/// Tracks the contractually promised lead time so the KPI dashboard can
/// compare it against the actual lead time measured on received orders.
/// </summary>
public class Supplier
{
    /// <summary>Unique identifier (Guid, NOT int — not a tenant-scoped EntityBase).</summary>
    public Guid Id { get; set; }

    /// <summary>Display name of the supplier company.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Primary contact email for the supplier.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// The number of calendar days the supplier promises between order placement
    /// and delivery (SLA / contractual lead time).
    /// </summary>
    public int PromisedLeadTimeDays { get; set; }

    /// <summary>Whether the supplier relationship is currently active.</summary>
    public bool IsActive { get; set; } = true;

    // ── Navigation ────────────────────────────────────────────────────────────

    /// <summary>Reorder requests assigned to this supplier.</summary>
    public ICollection<ReorderRequest> ReorderRequests { get; set; } = new List<ReorderRequest>();
}
