using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Commands.RestockProduct;

public class RestockProductCommandHandler : IRequestHandler<RestockProductCommand, int>
{
    private readonly IApplicationDbContext _context;

    public RestockProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(RestockProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FindAsync(new object[] { request.ProductId }, cancellationToken);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {request.ProductId} not found.");
        }

        product.CurrentStock += request.Quantity;

        await _context.SaveChangesAsync(cancellationToken);

        return product.CurrentStock;
    }
}
