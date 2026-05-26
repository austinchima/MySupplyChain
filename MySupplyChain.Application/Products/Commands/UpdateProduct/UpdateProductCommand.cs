using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Commands.UpdateProduct;

public record UpdateProductCommand : IRequest
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public decimal? Price { get; init; }
    public int? ReorderPoint { get; init; }
}

public class UpdateProductCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateProductCommand>
{
    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync([request.Id], cancellationToken);
        if (product == null) return;

        if (request.Name != null) product.Name = request.Name;
        if (request.Price.HasValue) product.Price = request.Price.Value;
        if (request.ReorderPoint.HasValue) product.ReorderPoint = request.ReorderPoint.Value;

        product.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
    }
}
