using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Queries.GetProductForecast;

/// <summary>
/// Handles demand forecasting using ML.NET SSA time series analysis
/// </summary>
public class GetProductForecastQueryHandler(IApplicationDbContext context, IDemandForecaster forecaster)
    : IRequestHandler<GetProductForecastQuery, ProductForecastDto>
{
    public async Task<ProductForecastDto> Handle(GetProductForecastQuery request, CancellationToken cancellationToken)
    {
        // 1. Fetch the target product details from database
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException($"Product with ID {request.ProductId} not found");

        // 2. Fetch historical sales data ordered chronologically (oldest → newest)
        // This chronological sorting is crucial for time-series modeling algorithms like SSA.
        var salesHistory = await context.SalesHistories
            .Where(s => s.ProductId == request.ProductId)
            .OrderBy(s => s.Date)
            .Select(s => (float)s.QuantitySold)
            .ToListAsync(cancellationToken);

        // 3. Generate multi-day demand forecast via ML.NET SSA or statistical fallback
        var forecast = salesHistory.Count != 0
            ? await forecaster.PredictDemandAsync(request.ProductId, product.Sku, salesHistory, request.DaysToForecast)
            : new ForecastResult
            {
                ForecastedUnits = new float[request.DaysToForecast],
                LowerBound = new float[request.DaysToForecast],
                UpperBound = new float[request.DaysToForecast],
                Rmse = 0f,
                Mae = 0f
            };

        // 4. Calculate total expected demand over the forecast horizon
        var totalPredictedDemand = forecast.ForecastedUnits.Sum();
        
        // 5. Establish a 50% safety buffer based on the product's default reorder point.
        // This mitigates the risk of stockouts due to forecasting error, delivery delays, or demand surges.
        var safetyBuffer = product.ReorderPoint * 0.5f;
        
        // 6. Assess whether stock levels are adequate to cover projected demand + safety buffer
        var shouldReorder = product.CurrentStock < totalPredictedDemand + safetyBuffer;
        
        // 7. Compose highly detailed action recommendations for inventory administrators
        var recommendation = shouldReorder
            ? $"⚠️ REORDER RECOMMENDED: Current stock ({product.CurrentStock}) is insufficient for " +
              $"projected {request.DaysToForecast}-day demand of {totalPredictedDemand:F1} units " +
              $"(95% CI: {forecast.LowerBound.Sum():F1}–{forecast.UpperBound.Sum():F1}). " +
              $"Suggested reorder: {(int)(totalPredictedDemand + safetyBuffer - product.CurrentStock + product.ReorderPoint)} units. " +
              $"Model accuracy: RMSE={forecast.Rmse:F2}, MAE={forecast.Mae:F2}."
            : $"✅ Stock levels are sufficient. Current: {product.CurrentStock} units. " +
              $"Projected {request.DaysToForecast}-day demand: {totalPredictedDemand:F1} units " +
              $"(95% CI: {forecast.LowerBound.Sum():F1}–{forecast.UpperBound.Sum():F1}). " +
              $"Model accuracy: RMSE={forecast.Rmse:F2}, MAE={forecast.Mae:F2}.";

        return new ProductForecastDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            CurrentStock = product.CurrentStock,
            ShouldReorder = shouldReorder,
            Recommendation = recommendation,
            ForecastedUnits = forecast.ForecastedUnits,
            LowerBound = forecast.LowerBound,
            UpperBound = forecast.UpperBound,
            TotalPredictedDemand = totalPredictedDemand,
            Rmse = forecast.Rmse,
            Mae = forecast.Mae,
            Horizon = request.DaysToForecast
        };
    }
}
