using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Enums;

namespace MySupplyChain.Application.Suppliers.Queries.GetSupplierKpi;

/// <summary>
/// Query that returns KPI metrics grouped by supplier.
/// Only active suppliers are returned.
/// </summary>
public record GetSupplierKpiQuery : IRequest<IEnumerable<SupplierKpiDto>>;

/// <summary>
/// Handler for <see cref="GetSupplierKpiQuery"/>.
/// Groups received orders by SupplierId and calculates:
///   - AvgActualLeadTimeDays
///   - OnTimePercentage (orders where ActualLeadTimeDays &lt;= PromisedLeadTimeDays)
/// </summary>
public class GetSupplierKpiQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetSupplierKpiQuery, IEnumerable<SupplierKpiDto>>
{
    public async Task<IEnumerable<SupplierKpiDto>> Handle(
        GetSupplierKpiQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Load all active suppliers
        var suppliers = await context.Suppliers
            .Where(s => s.IsActive)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // 2. Load all orders that have been received (Delivered) AND have a supplier assigned.
        //    We pull only the columns we need to avoid loading navigation graphs.
        //    NOTE: Orders use a global tenant query filter — this respects multi-tenancy automatically.
        var receivedOrders = await context.Orders
            .Where(o => o.SupplierId != null
                        && o.Status == OrderStatus.Delivered
                        && o.ActualLeadTimeDays != null)
            .AsNoTracking()
            .Select(o => new
            {
                o.SupplierId,
                o.ActualLeadTimeDays,
            })
            .ToListAsync(cancellationToken);

        // 3. Group orders by supplier and compute metrics in-memory (small result set)
        var ordersBySupplierId = receivedOrders
            .GroupBy(o => o.SupplierId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        // 4. Project to DTO — one row per active supplier
        var kpiRows = suppliers.Select(supplier =>
        {
            if (!ordersBySupplierId.TryGetValue(supplier.Id, out var supplierOrders)
                || supplierOrders.Count == 0)
            {
                // Supplier exists but has no received orders yet
                return new SupplierKpiDto
                {
                    SupplierId = supplier.Id,
                    SupplierName = supplier.Name,
                    PromisedLeadTimeDays = supplier.PromisedLeadTimeDays,
                    AvgActualLeadTimeDays = null,
                    OnTimePercentage = null,
                    TotalOrdersReceived = 0
                };
            }

            var totalOrders = supplierOrders.Count;
            var avgActual = supplierOrders.Average(o => (double)o.ActualLeadTimeDays!.Value);
            var onTimeCount = supplierOrders.Count(o => o.ActualLeadTimeDays!.Value <= supplier.PromisedLeadTimeDays);
            var onTimePct = (double)onTimeCount / totalOrders * 100.0;

            return new SupplierKpiDto
            {
                SupplierId = supplier.Id,
                SupplierName = supplier.Name,
                PromisedLeadTimeDays = supplier.PromisedLeadTimeDays,
                AvgActualLeadTimeDays = Math.Round(avgActual, 1),
                OnTimePercentage = Math.Round(onTimePct, 1),
                TotalOrdersReceived = totalOrders
            };
        });

        return kpiRows.OrderBy(k => k.SupplierName);
    }
}
