using MediatR;

namespace MySupplyChain.Application.Products.Queries.GetProductForecast;

/// <summary>
/// Query to get AI-powered demand forecast for a product
/// </summary>
public record GetProductForecastQuery : IRequest<ProductForecastDto>
{
    public int ProductId { get; init; }
    public int DaysToForecast { get; init; } = 30;
}

/// <summary>
/// DTO for forecast results
/// </summary>
public record ProductForecastDto
{
    public int ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public float PredictedDemand { get; init; }
    public int CurrentStock { get; init; }
    public bool ShouldReorder { get; init; }
    public string Recommendation { get; init; } = string.Empty;
}
