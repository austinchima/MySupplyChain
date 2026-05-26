using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Commands.DeleteProduct;

public record DeleteProductCommand(int Id) : IRequest;

public class DeleteProductCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteProductCommand>
{
    public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products
            .Include(p => p.SalesHistory)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null) return;

        context.Products.Remove(product);
        await context.SaveChangesAsync(cancellationToken);
    }
}
