using MediatR;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Application.Products.Commands.CreateProduct;

/// <summary>
/// Handles the creation of a new product
/// </summary>
public class CreateProductCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateProductCommand, int>
{
    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Sku = request.Sku,
            Price = request.Price,
            CurrentStock = request.CurrentStock,
            ReorderPoint = request.ReorderPoint
        };

        context.Products.Add(product);
        await context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}
