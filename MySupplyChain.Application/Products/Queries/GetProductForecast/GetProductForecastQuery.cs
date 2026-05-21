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
/// DTO for multi-day SSA time series forecast results
/// </summary>
public record ProductForecastDto
{
    public int ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public int CurrentStock { get; init; }
    public bool ShouldReorder { get; init; }
    public string Recommendation { get; init; } = string.Empty;

    /// <summary>
    /// Point forecasts for each day in the horizon
    /// </summary>
    public float[] ForecastedUnits { get; init; } = [];

    /// <summary>
    /// Lower 95% confidence bound for each day
    /// </summary>
    public float[] LowerBound { get; init; } = [];

    /// <summary>
    /// Upper 95% confidence bound for each day
    /// </summary>
    public float[] UpperBound { get; init; } = [];

    /// <summary>
    /// Total predicted demand across the full forecast horizon
    /// </summary>
    public float TotalPredictedDemand { get; init; }

    /// <summary>
    /// Model accuracy — Root Mean Squared Error
    /// </summary>
    public float Rmse { get; init; }

    /// <summary>
    /// Model accuracy — Mean Absolute Error
    /// </summary>
    public float Mae { get; init; }

    /// <summary>
    /// Number of days in the forecast
    /// </summary>
    public int Horizon { get; init; }
}
