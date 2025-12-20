using MediatR;

namespace MySupplyChain.Application.Products.Commands.RestockProduct;

public record RestockProductCommand(int ProductId, int Quantity) : IRequest<int>;
