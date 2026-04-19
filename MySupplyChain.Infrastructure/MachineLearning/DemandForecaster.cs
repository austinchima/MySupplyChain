using Microsoft.Extensions.Logging;
using Microsoft.ML;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.Infrastructure.MachineLearning;

/// <summary>
/// ML.NET implementation of demand forecasting
/// </summary>
public class DemandForecaster : IDemandForecaster
{
    private readonly MLContext _mlContext;
    private readonly ITransformer? _model;
    private readonly string _modelPath;
    private readonly ILogger<DemandForecaster> _logger;

    public bool IsModelLoaded => _model != null;

    public DemandForecaster(string modelPath, ILogger<DemandForecaster> logger)
    {
        _mlContext = new MLContext(seed: 0);
        _modelPath = modelPath;
        _logger = logger;

        try
        {
            if (File.Exists(_modelPath))
            {
                // Load the trained model if it exists
                _model = _mlContext.Model.Load(_modelPath, out _);
                _logger.LogInformation("ML model loaded: {ModelFile}", Path.GetFileName(_modelPath));
            }
            else
            {
                _logger.LogInformation("No ML model found at startup. Expected file: {ModelFile}",
                    Path.GetFileName(_modelPath));
            }
        }
        catch (Exception ex)
        {
            // Avoid logging sensitive file system details. Log filename and error.
            _logger.LogError(ex, "Failed to load ML model file {ModelFile}", Path.GetFileName(_modelPath));
            _model = null;
        }
    }

    public Task<float> PredictDemandAsync(int productId, string sku, IEnumerable<float> historicalSales)
    {
        // Materialize the enumerable once to avoid multiple enumeration
        var salesList = historicalSales.ToList();

        if (!IsModelLoaded)
        {
            // Fallback: simple moving average if model not trained yet
            var avg = salesList.Count != 0 ? salesList.Average() : 0f;
            _logger.LogWarning(
                "Model not loaded. Returning fallback average for product {ProductId} based on {Count} historical entries.",
                productId, salesList.Count);
            return Task.FromResult(avg);
        }

        try
        {
            // Create prediction engine
            var predictionEngine = _mlContext.Model.CreatePredictionEngine<ModelInput, ModelOutput>(_model);

            // Prepare input (simplified - using average of recent sales)
            var recentSales = salesList.Take(30).ToList();
            var avgSales = recentSales.Count != 0 ? recentSales.Average() : 0f;

            var input = new ModelInput
            {
                ProductId = productId,
                Sku = sku,
                QuantitySold = avgSales,
                DayOfWeek = (int)DateTime.Now.DayOfWeek,
                Month = DateTime.Now.Month,
                Date = DateTime.Now.ToString("yyyy-MM-dd"),
                Price = 0 // Would need to be passed in for real scenarios
            };

            // Make prediction
            var prediction = predictionEngine.Predict(input);
            _logger.LogInformation("Prediction successful for product {ProductId}. ModelFile={ModelFile}", productId,
                Path.GetFileName(_modelPath));
            return Task.FromResult(prediction.PredictedDemand);
        }
        catch (Exception ex)
        {
            // Log error without exposing sensitive inputs; include product id and count of historical points
            _logger.LogError(ex,
                "Prediction failed for product {ProductId} with {HistoricalCount} historical points using model {ModelFile}",
                productId, salesList.Count, Path.GetFileName(_modelPath));

            // Fallback: return moving average
            var avg = salesList.Count != 0 ? salesList.Average() : 0f;
            _logger.LogWarning("Returning fallback average for product {ProductId} after prediction failure.",
                productId);
            return Task.FromResult(avg);
        }
    }
}
