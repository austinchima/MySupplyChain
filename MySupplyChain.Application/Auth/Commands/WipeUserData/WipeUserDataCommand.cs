using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.WipeUserData;

public record WipeUserDataCommand : IRequest;

public class WipeUserDataCommandHandler(IApplicationDbContext context) : IRequestHandler<WipeUserDataCommand>
{
    public async Task Handle(WipeUserDataCommand request, CancellationToken cancellationToken)
    {
        // In a real multi-tenant app, filter by UserId. 
        // For this single-user demo/prototype, we wipe the global tables.
        
        context.SalesHistories.RemoveRange(context.SalesHistories);
        context.Orders.RemoveRange(context.Orders);
        context.Products.RemoveRange(context.Products);
        context.Customers.RemoveRange(context.Customers);
        context.ReorderRequests.RemoveRange(context.ReorderRequests);

        await context.SaveChangesAsync(cancellationToken);
    }
}
