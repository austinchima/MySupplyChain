using MediatR;

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand(int ProductId, int Quantity) : IRequest<int>;
