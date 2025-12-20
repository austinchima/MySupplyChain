using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Queries.GetAllProducts;

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, List<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllProductsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _context.Products.ToListAsync(cancellationToken);

        return products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Sku = p.Sku,
            CurrentStock = p.CurrentStock,
            ReorderPoint = p.ReorderPoint,
            Price = p.Price,
            HealthStatus = p.CurrentStock <= p.ReorderPoint ? "Low Stock" : "Healthy"
        }).ToList();
    }
}
