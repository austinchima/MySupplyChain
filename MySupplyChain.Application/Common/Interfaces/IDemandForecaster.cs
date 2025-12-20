namespace MySupplyChain.Application.Common.Interfaces;

/// <summary>
/// Interface for AI-powered demand forecasting service
/// </summary>
public interface IDemandForecaster
{
    /// <summary>
    /// Predicts future demand for a product based on historical data
    /// </summary>
    /// <param name="productId">The product to forecast</param>
    /// <param name="historicalSales">Recent sales data points</param>
    /// <returns>Predicted demand quantity</returns>
    Task<float> PredictDemandAsync(int productId, IEnumerable<float> historicalSales);
}
