using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Products.Queries.GetProductForecast;

/// <summary>
/// Handles demand forecasting using ML.NET
/// </summary>
public class GetProductForecastQueryHandler : IRequestHandler<GetProductForecastQuery, ProductForecastDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDemandForecaster _forecaster;

    public GetProductForecastQueryHandler(IApplicationDbContext context, IDemandForecaster forecaster)
    {
        _context = context;
        _forecaster = forecaster;
    }

    public async Task<ProductForecastDto> Handle(GetProductForecastQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException($"Product with ID {request.ProductId} not found");

        // Get historical sales data
        var salesHistory = await _context.SalesHistories
            .Where(s => s.ProductId == request.ProductId)
            .OrderByDescending(s => s.Date)
            .Take(90) // Last 90 days
            .Select(s => (float)s.QuantitySold)
            .ToListAsync(cancellationToken);

        // Use AI to predict demand
        var predictedDemand = salesHistory.Any() 
            ? await _forecaster.PredictDemandAsync(request.ProductId, salesHistory)
            : 0f;

        // ⭐ IMPROVED LOGIC: Use predicted demand + safety buffer
        var safetyBuffer = product.ReorderPoint * 0.5f; // 50% safety margin
        var minimumRequired = predictedDemand + safetyBuffer;
        var shouldReorder = product.CurrentStock < minimumRequired;
        
        var recommendation = shouldReorder
            ? $"⚠️ REORDER RECOMMENDED: Current stock ({product.CurrentStock}) is below safe level. " +
            $"Predicted demand: {predictedDemand:F1} units, Safety buffer: {safetyBuffer:F1} units. " +
            $"Suggested reorder: {(int)(minimumRequired - product.CurrentStock + product.ReorderPoint)} units."
            : $"✅ Stock levels are sufficient. Current: {product.CurrentStock} units, " +
            $"Predicted demand: {predictedDemand:F1} units (next {request.DaysToForecast} days).";

        return new ProductForecastDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            PredictedDemand = predictedDemand,
            CurrentStock = product.CurrentStock,
            ShouldReorder = shouldReorder,
            Recommendation = recommendation
        };
    }
}
