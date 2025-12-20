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

    public DemandForecaster(string modelPath)
    {
        _mlContext = new MLContext(seed: 0);
        _modelPath = modelPath;

        // Load the trained model if it exists
        if (File.Exists(_modelPath))
        {
            _model = _mlContext.Model.Load(_modelPath, out _);
        }
    }

    public Task<float> PredictDemandAsync(int productId, IEnumerable<float> historicalSales)
    {
        if (_model == null)
        {
            // Fallback: simple moving average if model not trained yet
            var salesList = historicalSales.ToList();
            return Task.FromResult(salesList.Any() ? salesList.Average() : 0f);
        }

        // Create prediction engine
        var predictionEngine = _mlContext.Model.CreatePredictionEngine<ModelInput, ModelOutput>(_model);

        // Prepare input (simplified - using average of recent sales)
        var recentSales = historicalSales.Take(30).ToList();
        var avgSales = recentSales.Any() ? recentSales.Average() : 0f;

        var input = new ModelInput
        {
            ProductId = productId,
            QuantitySold = avgSales,
            DayOfWeek = (int)DateTime.Now.DayOfWeek,
            Month = DateTime.Now.Month,
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            Price = 0 // Would need to be passed in for real scenarios
        };

        // Make prediction
        var prediction = predictionEngine.Predict(input);
        return Task.FromResult(prediction.PredictedDemand);
    }
}
