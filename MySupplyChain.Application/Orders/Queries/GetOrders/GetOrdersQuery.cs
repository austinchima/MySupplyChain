using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Orders.Queries.GetOrders;

public record GetOrdersQuery : IRequest<IEnumerable<OrderDto>>;

public class GetOrdersQueryHandler(IApplicationDbContext context) : IRequestHandler<GetOrdersQuery, IEnumerable<OrderDto>>
{
    public async Task<IEnumerable<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            Date = o.OrderDate.ToString("MMM dd, HH:mm"),
            Customer = o.Customer?.Name ?? "Unknown Customer",
            Items = o.Items.Sum(i => i.Quantity),
            Status = o.Status.ToString().ToLower(),
            Total = o.TotalAmount.ToString("C")
        });
    }
}
