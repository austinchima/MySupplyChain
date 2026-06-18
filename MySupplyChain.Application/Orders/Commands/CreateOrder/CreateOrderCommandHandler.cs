using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Exceptions;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;
using System.Text.Json;

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler(IApplicationDbContext context, IEventIngestionChannel channel)
    : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch the target product to check current stock status (Read Model)
        var product = await context.Products
            .FindAsync([request.ProductId], cancellationToken);

        if (product == null)
            throw new NotFoundException($"Product {request.ProductId} not found");

        // 2. Validate that inventory levels can satisfy the order quantity
        if (product.CurrentStock < request.Quantity)
             throw new ValidationException(new Dictionary<string, string[]> { { "Quantity", new[] { "Insufficient stock" } } });

        // 3. Instead of synchronous DB commit and ML.NET inference, we construct an Event
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4)}";
        var payload = new
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            OrderNumber = orderNumber,
            CustomerId = 1 // Hardcoded or pulled from context
        };

        var evt = new SupplyChainEvent
        {
            Id = Guid.NewGuid(),
            AggregateType = "Order",
            AggregateId = orderNumber,
            EventType = "OrderPlaced",
            Payload = JsonSerializer.Serialize(payload),
            Timestamp = DateTime.UtcNow
        };

        // 4. Push to the memory-bounded Channel for background processing
        await channel.PushEventAsync(evt, cancellationToken);

        // 5. Return an optimistic projection of the stock level to the caller
        return product.CurrentStock - request.Quantity;
    }
}
