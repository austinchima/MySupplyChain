using MediatR;
using Microsoft.Extensions.Logging;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.WipeUserData;

public record WipeUserDataCommand(string CurrentUserId) : IRequest;

public class WipeUserDataCommandHandler(
    IApplicationDbContext context,
    ILogger<WipeUserDataCommandHandler> logger) : IRequestHandler<WipeUserDataCommand>
{
    public async Task Handle(WipeUserDataCommand request, CancellationToken cancellationToken)
    {
        // Validate that a user ID was provided
        if (string.IsNullOrEmpty(request.CurrentUserId))
            throw new UnauthorizedAccessException("User must be authenticated to wipe their data");

        // Log the sensitive operation
        logger.LogWarning("User {UserId} is wiping all their business data", request.CurrentUserId);

        // The global query filters automatically scope these collections
        // to the current authenticated user's data.
        context.SalesHistories.RemoveRange(context.SalesHistories);
        context.Orders.RemoveRange(context.Orders);
        context.Products.RemoveRange(context.Products);
        context.Customers.RemoveRange(context.Customers);
        context.ReorderRequests.RemoveRange(context.ReorderRequests);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User {UserId} successfully wiped all their business data", request.CurrentUserId);
    }
}
