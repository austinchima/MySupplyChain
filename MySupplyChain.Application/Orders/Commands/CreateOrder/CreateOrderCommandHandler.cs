using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Exceptions;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler(IApplicationDbContext context, IDemandForecaster forecaster)
    : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch the target product to check current stock status
        var product = await context.Products
            .FindAsync([request.ProductId], cancellationToken);

        if (product == null)
            throw new NotFoundException($"Product {request.ProductId} not found");

        // 2. Validate that inventory levels can satisfy the order quantity
        if (product.CurrentStock < request.Quantity)
             throw new ValidationException(new Dictionary<string, string[]> { { "Quantity", new[] { "Insufficient stock" } } });

        // 3. Deduct physical stock from catalog inventory
        product.CurrentStock -= request.Quantity;

        // 4. Create and record a denormalized transaction in the sales history log.
        // This chronological log serves as raw time-series input for the AI Demand Forecaster.
        var sale = new SalesHistory
        {
            ProductId = request.ProductId,
            Sku = product.Sku,
            Date = DateTime.UtcNow,
            QuantitySold = request.Quantity
        };
        
        context.SalesHistories.Add(sale);

        // 5. Commit database changes transactionally
        await context.SaveChangesAsync(cancellationToken);

        // 6. Trigger intelligent automated restocking if stock drops below the threshold reorder point
        if (product.CurrentStock <= product.ReorderPoint)
        {
            await CreateReorderRequestAsync(product, cancellationToken);
        }

        return product.CurrentStock;
    }

    private async Task CreateReorderRequestAsync(Product product, CancellationToken cancellationToken)
    {
        // Prevent duplicate reorders: Check if an active reorder request already exists (Pending or Approved)
        var activeReorderExists = await context.ReorderRequests
            .AnyAsync(r => r.ProductId == product.Id && 
                           (r.Status == Domain.Enums.Status.Pending || r.Status == Domain.Enums.Status.Approved), 
                           cancellationToken);

        if (activeReorderExists) return;

        // Fetch chronological sales transaction logs (up to last 90 records)
        // A minimum of 14 points is mathematically required for SSA, and larger counts improve stability
        var history = await context.SalesHistories
            .Where(s => s.ProductId == product.Id)
            .OrderByDescending(s => s.Date)
            .Take(90)
            .Select(s => (float)s.QuantitySold)
            .ToListAsync(cancellationToken);

        // Reverse records to oldest → newest order as required by the time-series model
        history.Reverse();

        // Invoke ML.NET or statistical fallback forecasting engine to compute future trend vector
        var forecast = await forecaster.PredictDemandAsync(product.Id, product.Sku, history);
        
        // Sum projected demand for the next 7 days (weekly forecast slice)
        var weeklyDemand = forecast.ForecastedUnits.Take(7).Sum();
        var predictedDemand = (decimal)forecast.ForecastedUnits[0];
        
        // Formula: Purchase quantity equals twice the weekly projected demand to cover a 2-week cycle,
        // subject to a shipping-optimized minimum order quantity floor of 50 units.
        var quantityToOrder = (int)Math.Max(50, weeklyDemand * 2);

        var request = new ReorderRequest
        {
            ProductId = product.Id,
            QuantityToOrder = quantityToOrder,
            PredictedDemand = predictedDemand,
            RequestedAt = DateTime.UtcNow,
            Status = Domain.Enums.Status.Pending,
            Justification = $"Stock ({product.CurrentStock}) fell below reorder point ({product.ReorderPoint}). " +
                           $"SSA Forecast: next-day demand = {forecast.ForecastedUnits[0]:F1} units, " +
                           $"7-day total = {weeklyDemand:F1} units (RMSE={forecast.Rmse:F2})."
        };

        context.ReorderRequests.Add(request);
        await context.SaveChangesAsync(cancellationToken);
    }
}
