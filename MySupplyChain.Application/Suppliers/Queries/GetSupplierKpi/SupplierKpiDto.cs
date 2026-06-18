namespace MySupplyChain.Application.Suppliers.Queries.GetSupplierKpi;

/// <summary>
/// DTO returned per-supplier by the KPI query.
/// Mirrors the columns shown in the SupplierKpiPage table.
/// </summary>
public class SupplierKpiDto
{
    /// <summary>Supplier primary key.</summary>
    public Guid SupplierId { get; init; }

    /// <summary>Human-readable supplier name.</summary>
    public string SupplierName { get; init; } = string.Empty;

    /// <summary>Contractually promised lead time in calendar days.</summary>
    public int PromisedLeadTimeDays { get; init; }

    /// <summary>
    /// Average actual lead time (in calendar days) across all received orders
    /// assigned to this supplier. Null when no orders have been received yet.
    /// </summary>
    public double? AvgActualLeadTimeDays { get; init; }

    /// <summary>
    /// Percentage of received orders whose ActualLeadTimeDays &lt;= PromisedLeadTimeDays.
    /// Null when there are no received orders.
    /// </summary>
    public double? OnTimePercentage { get; init; }

    /// <summary>Total number of orders received from this supplier.</summary>
    public int TotalOrdersReceived { get; init; }
}
