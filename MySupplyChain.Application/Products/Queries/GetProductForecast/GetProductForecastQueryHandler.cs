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
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException($"Product with ID {request.ProductId} not found");

        // Get historical sales data ordered chronologically (oldest → newest)
        var salesHistory = await context.SalesHistories
            .Where(s => s.ProductId == request.ProductId)
            .OrderBy(s => s.Date)
            .Select(s => (float)s.QuantitySold)
            .ToListAsync(cancellationToken);

        // Use SSA to generate multi-day forecast
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

        var totalPredictedDemand = forecast.ForecastedUnits.Sum();
        var safetyBuffer = product.ReorderPoint * 0.5f;
        var shouldReorder = product.CurrentStock < totalPredictedDemand + safetyBuffer;
        
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
