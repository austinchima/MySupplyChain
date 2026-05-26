using MediatR;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Enums;

namespace MySupplyChain.Application.Orders.Commands.UpdateOrder;

public record UpdateOrderCommand(int Id, OrderStatus Status) : IRequest;

public class UpdateOrderCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateOrderCommand>
{
    public async Task Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await context.Orders.FindAsync([request.Id], cancellationToken);
        if (order == null) return;

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
    }
}
