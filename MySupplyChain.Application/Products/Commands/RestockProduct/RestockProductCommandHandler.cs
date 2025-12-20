using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Commands.RestockProduct;

public class RestockProductCommandHandler(IApplicationDbContext context) : IRequestHandler<RestockProductCommand, int>
{
    public async Task<int> Handle(RestockProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync([request.ProductId], cancellationToken);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {request.ProductId} not found.");
        }

        product.CurrentStock += request.Quantity;

        await context.SaveChangesAsync(cancellationToken);

        return product.CurrentStock;
    }
}
