using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.ReorderRequests.Queries.GetReorderRequests;

public class GetReorderRequestsHandler(IApplicationDbContext context)
    : IRequestHandler<GetReorderRequestsQuery, List<ReorderRequestDto>>
{
    public async Task<List<ReorderRequestDto>> Handle(GetReorderRequestsQuery request, CancellationToken cancellationToken)
    {
        var requests = await context.ReorderRequests
            .Include(r => r.Product)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync(cancellationToken);

        return [.. requests.Select(r => new ReorderRequestDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            ProductName = r.Product?.Name ?? "Unknown Product",
            QuantityToOrder = r.QuantityToOrder,
            PredictedDemand = r.PredictedDemand,
            RequestedAt = r.RequestedAt,
            Status = r.Status.ToString(),
            Justification = r.Justification
        })];
    }
}
