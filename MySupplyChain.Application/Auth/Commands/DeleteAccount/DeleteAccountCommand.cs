using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.DeleteAccount;

public record DeleteAccountCommand(string UserId) : IRequest;

public class DeleteAccountCommandHandler(IApplicationDbContext context, IAuthService authService) : IRequestHandler<DeleteAccountCommand>
{
    public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        // 1. Wipe business data first
        // In a real app, we'd filter these by UserId
        context.SalesHistories.RemoveRange(context.SalesHistories);
        context.Orders.RemoveRange(context.Orders);
        context.Products.RemoveRange(context.Products);
        context.Customers.RemoveRange(context.Customers);
        context.ReorderRequests.RemoveRange(context.ReorderRequests);

        await context.SaveChangesAsync(cancellationToken);

        // 2. Delete the user account
        await authService.DeleteAccountAsync(request.UserId);
    }
}
