using MediatR;

namespace MySupplyChain.Application.Products.Commands.CreateProduct;

/// <summary>
/// Command to create a new product in the system
/// </summary>
public record CreateProductCommand : IRequest<int>
{
    public string Name { get; init; } = string.Empty;
    public string Sku { get; init; } = string.Empty;  // Add this too
    public decimal Price { get; init; }
    public int CurrentStock { get; init; }
    public int ReorderPoint { get; init; }  // Changed from ReorderThreshold
}
