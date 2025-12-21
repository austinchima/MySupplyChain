using MediatR;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler(IApplicationDbContext context, IDemandForecaster forecaster)
    : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products
            .FindAsync([request.ProductId], cancellationToken);

        if (product == null)
            throw new Exception($"Product {request.ProductId} not found");

        if (product.CurrentStock < request.Quantity)
             throw new Exception($"Insufficient stock for Product {product.Name}. Requested: {request.Quantity}, Available: {product.CurrentStock}");

        // Decrement stock
        product.CurrentStock -= request.Quantity;

        // Record the sale
        var sale = new SalesHistory
        {
            ProductId = request.ProductId,
            Sku = product.Sku, // Include SKU for ML training
            Date = DateTime.UtcNow,
            QuantitySold = request.Quantity
        };
        
        context.SalesHistories.Add(sale);

        await context.SaveChangesAsync(cancellationToken);

        // Check for reorder asynchronously
        if (product.CurrentStock <= product.ReorderPoint)
        {
            await CreateReorderRequestAsync(product, cancellationToken);
        }

        return product.CurrentStock;
    }

    private async Task CreateReorderRequestAsync(Product product, CancellationToken cancellationToken)
    {
        // Check if an active reorder already exists (Pending or Approved)
        var activeReorderExists = await context.ReorderRequests
            .AnyAsync(r => r.ProductId == product.Id && 
                          (r.Status == Domain.Enums.Status.Pending || r.Status == Domain.Enums.Status.Approved), 
                          cancellationToken);

        if (activeReorderExists) return;

        // Get sales history for forecasting (last 30 records)
        var history = await context.SalesHistories
            .Where(s => s.ProductId == product.Id)
            .OrderByDescending(s => s.Date)
            .Take(30)
            .Select(s => (float)s.QuantitySold)
            .ToListAsync(cancellationToken);

        var prediction = await forecaster.PredictDemandAsync(product.Id, product.Sku, history);
        
        // Logic: Order enough to cover prediction + buffer, or fixed amount
        var predictedDemand = (decimal)prediction;
        var quantityToOrder = (int)Math.Max(50, prediction * 1.5); // Simple rule

        var request = new ReorderRequest
        {
            ProductId = product.Id,
            QuantityToOrder = quantityToOrder,
            PredictedDemand = predictedDemand,
            RequestedAt = DateTime.UtcNow,
            Status = Domain.Enums.Status.Pending,
            Justification = $"Stock ({product.CurrentStock}) fell below reorder point ({product.ReorderPoint}). AI Forecast predicts demand of {predictedDemand:F1}."
        };

        context.ReorderRequests.Add(request);
        await context.SaveChangesAsync(cancellationToken);
    }
}

