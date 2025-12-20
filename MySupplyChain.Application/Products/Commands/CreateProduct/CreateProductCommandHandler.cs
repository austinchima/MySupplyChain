using MediatR;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Application.Products.Commands.CreateProduct;

/// <summary>
/// Handles the creation of a new product
/// </summary>
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Price = request.Price,
            CurrentStock = request.CurrentStock,
            ReorderPoint = request.ReorderPoint
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}
