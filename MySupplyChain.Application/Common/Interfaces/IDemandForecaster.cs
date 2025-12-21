namespace MySupplyChain.Application.Common.Interfaces;

/// <summary>
/// Interface for AI-powered demand forecasting service
/// </summary>
public interface IDemandForecaster
{
    /// <summary>
    /// Predicts future demand for a product based on historical data
    /// </summary>
    /// <param name="productId">The product ID to forecast</param>
    /// <param name="sku">The product SKU</param>
    /// <param name="historicalSales">Recent sales data points</param>
    /// <returns>Predicted demand quantity</returns>
    Task<float> PredictDemandAsync(int productId, string sku, IEnumerable<float> historicalSales);

    /// <summary>
    /// Indicates whether a ML model is currently loaded and available for predictions
    /// </summary>
    bool IsModelLoaded { get; }
}
