using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.WipeUserData;

public record WipeUserDataCommand : IRequest;

public class WipeUserDataCommandHandler(IApplicationDbContext context) : IRequestHandler<WipeUserDataCommand>
{
    public async Task Handle(WipeUserDataCommand request, CancellationToken cancellationToken)
    {
        // The global query filters automatically scope these collections
        // to the current authenticated user's data.
        
        context.SalesHistories.RemoveRange(context.SalesHistories);
        context.Orders.RemoveRange(context.Orders);
        context.Products.RemoveRange(context.Products);
        context.Customers.RemoveRange(context.Customers);
        context.ReorderRequests.RemoveRange(context.ReorderRequests);

        await context.SaveChangesAsync(cancellationToken);
    }
}
