using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.BackgroundServices;

public class AllocationProcessingWorker(
    EventIngestionChannel channel,
    IServiceProvider serviceProvider,
    ILogger<AllocationProcessingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Allocation Processing Worker started.");

        await foreach (var evt in channel.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                var forecaster = scope.ServiceProvider.GetRequiredService<IDemandForecaster>();

                // 1. Persist the raw event to the immutable ledger
                context.SupplyChainEvents.Add(evt);
                await context.SaveChangesAsync(stoppingToken);

                // 2. Project to materialized views & execute ML logic
                if (evt.EventType == "OrderPlaced")
                {
                    await ProcessOrderPlacedAsync(evt, context, forecaster, stoppingToken);
                }
                
                // We can add other event types here (e.g., InventoryRestocked)
                
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing event {EventId}", evt.Id);
            }
        }
    }

    private async Task ProcessOrderPlacedAsync(SupplyChainEvent evt, IApplicationDbContext context, IDemandForecaster forecaster, CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Deserialize<OrderPlacedPayload>(evt.Payload);
        if (payload == null) return;

        var product = await context.Products.FindAsync([payload.ProductId], cancellationToken);
        if (product == null) return;

        // Deduct physical stock from catalog inventory
        product.CurrentStock -= payload.Quantity;

        var sale = new SalesHistory
        {
            ProductId = payload.ProductId,
            Sku = product.Sku,
            Date = evt.Timestamp,
            QuantitySold = payload.Quantity
        };
        context.SalesHistories.Add(sale);

        // Record the actual Order in the materialized view
        var order = new Order
        {
            OrderNumber = payload.OrderNumber,
            OrderDate = evt.Timestamp,
            TotalAmount = payload.Quantity * product.Price, // simplistic
            Status = Domain.Enums.OrderStatus.Pending,
            Customer = await context.Customers.FindAsync([payload.CustomerId], cancellationToken)
        };
        context.Orders.Add(order);
        
        var orderItem = new OrderItem
        {
            Order = order,
            Product = product,
            Quantity = payload.Quantity,
            UnitPrice = product.Price
        };
        context.OrderItems.Add(orderItem);

        await context.SaveChangesAsync(cancellationToken);

        // ML.NET Restocking Logic
        if (product.CurrentStock <= product.ReorderPoint)
        {
            await CreateReorderRequestAsync(product, context, forecaster, cancellationToken);
        }
    }

    private async Task CreateReorderRequestAsync(Product product, IApplicationDbContext context, IDemandForecaster forecaster, CancellationToken cancellationToken)
    {
        var activeReorderExists = await context.ReorderRequests
            .AnyAsync(r => r.ProductId == product.Id && 
                           (r.Status == Domain.Enums.Status.Pending || r.Status == Domain.Enums.Status.Approved), 
                           cancellationToken);

        if (activeReorderExists) return;

        var history = await context.SalesHistories
            .Where(s => s.ProductId == product.Id)
            .OrderByDescending(s => s.Date)
            .Take(90)
            .Select(s => (float)s.QuantitySold)
            .ToListAsync(cancellationToken);

        history.Reverse();

        var forecast = await forecaster.PredictDemandAsync(product.Id, product.Sku, history);
        
        var weeklyDemand = forecast.ForecastedUnits.Take(7).Sum();
        var predictedDemand = (decimal)forecast.ForecastedUnits[0];
        
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

public class OrderPlacedPayload
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
}
