using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Orders.Commands.DeleteOrder;

public record DeleteOrderCommand(int Id) : IRequest;

public class DeleteOrderCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteOrderCommand>
{
    public async Task Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await context.Orders.FindAsync([request.Id], cancellationToken);
        if (order == null) return;

        context.Orders.Remove(order);
        await context.SaveChangesAsync(cancellationToken);
    }
}
