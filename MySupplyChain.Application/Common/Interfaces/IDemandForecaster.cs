namespace MySupplyChain.Application.Common.Interfaces;

/// <summary>
/// Forecast result containing multi-day predictions with confidence intervals
/// </summary>
public record ForecastResult
{
    /// <summary>
    /// Point forecasts for each day in the forecast horizon
    /// </summary>
    public required float[] ForecastedUnits { get; init; }

    /// <summary>
    /// Lower confidence bound (95%) for each day
    /// </summary>
    public required float[] LowerBound { get; init; }

    /// <summary>
    /// Upper confidence bound (95%) for each day
    /// </summary>
    public required float[] UpperBound { get; init; }

    /// <summary>
    /// Root Mean Squared Error of the model on validation data
    /// </summary>
    public float Rmse { get; init; }

    /// <summary>
    /// Mean Absolute Error of the model on validation data
    /// </summary>
    public float Mae { get; init; }

    /// <summary>
    /// Number of days in the forecast horizon
    /// </summary>
    public int Horizon => ForecastedUnits.Length;
}

/// <summary>
/// Interface for AI-powered demand forecasting using SSA time series analysis
/// </summary>
public interface IDemandForecaster
{
    /// <summary>
    /// Generates a multi-day demand forecast for a product based on historical time series data
    /// </summary>
    /// <param name="productId">The product ID to forecast</param>
    /// <param name="sku">The product SKU</param>
    /// <param name="historicalSales">Daily sales data points ordered chronologically (oldest → newest)</param>
    /// <param name="horizon">Number of days to forecast (default 30)</param>
    /// <returns>Multi-day forecast with confidence intervals and accuracy metrics</returns>
    Task<ForecastResult> PredictDemandAsync(int productId, string sku, IEnumerable<float> historicalSales, int horizon = 30);

    /// <summary>
    /// Indicates whether a ML model is currently loaded and available for predictions
    /// </summary>
    bool IsModelLoaded { get; }
}
