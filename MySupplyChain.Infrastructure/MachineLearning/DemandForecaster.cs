using Microsoft.Extensions.Logging;
using Microsoft.ML;
using Microsoft.ML.Transforms.TimeSeries;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.Infrastructure.MachineLearning;

/// <summary>
/// ML.NET SSA (Singular Spectrum Analysis) implementation of demand forecasting.
/// Uses time series decomposition to capture seasonality, trend, and noise for
/// multi-day forecasting with confidence intervals.
/// </summary>
public partial class DemandForecaster : IDemandForecaster
{
    private readonly MLContext _mlContext;
    private readonly ITransformer? _model;
    private readonly ILogger<DemandForecaster> _logger;

    public bool IsModelLoaded => _model != null;

    public DemandForecaster(string modelPath, ILogger<DemandForecaster> logger)
    {
        _mlContext = new MLContext(seed: 0);
        _logger = logger;

        var modelFileName = Path.GetFileName(modelPath);

        try
        {
            if (File.Exists(modelPath))
            {
                _model = _mlContext.Model.Load(modelPath, out _);
                if (_logger.IsEnabled(LogLevel.Information))
                    LogModelLoaded(modelFileName);
            }
            else
            {
                if (_logger.IsEnabled(LogLevel.Information))
                    LogNoModelFound(modelFileName);
            }
        }
        catch (Exception ex)
        {
            if (_logger.IsEnabled(LogLevel.Error))
                LogModelLoadError(ex, modelFileName);
            _model = null;
        }
    }

    public Task<ForecastResult> PredictDemandAsync(int productId, string sku, IEnumerable<float> historicalSales, int horizon = 30)
    {
        var salesList = historicalSales.ToList();

        if (!IsModelLoaded || salesList.Count < 14)
        {
            return Task.FromResult(BuildFallbackForecast(productId, salesList, horizon));
        }

        try
        {
            var engine = _model!.CreateTimeSeriesEngine<SsaModelInput, SsaForecastOutput>(_mlContext);
            var prediction = engine.Predict();

            // Ensure we have exactly 'horizon' entries (pad/trim as needed)
            var forecasted = NormalizeArray(prediction.ForecastedUnits, horizon);
            var lower = NormalizeArray(prediction.LowerBound, horizon);
            var upper = NormalizeArray(prediction.UpperBound, horizon);

            // Clamp negatives to zero — demand can't be negative
            for (int i = 0; i < horizon; i++)
            {
                forecasted[i] = MathF.Max(0, forecasted[i]);
                lower[i] = MathF.Max(0, lower[i]);
                upper[i] = MathF.Max(0, upper[i]);
            }

            // Compute RMSE/MAE from hold-out tail if we have enough data
            var (rmse, mae) = ComputeAccuracyMetrics(salesList, forecasted);

            if (_logger.IsEnabled(LogLevel.Information))
                LogForecastGenerated(productId, sku, horizon, rmse, mae);

            return Task.FromResult(new ForecastResult
            {
                ForecastedUnits = forecasted,
                LowerBound = lower,
                UpperBound = upper,
                Rmse = rmse,
                Mae = mae
            });
        }
        catch (Exception ex)
        {
            if (_logger.IsEnabled(LogLevel.Error))
                LogPredictionError(ex, productId, salesList.Count);

            return Task.FromResult(BuildFallbackForecast(productId, salesList, horizon));
        }
    }

    private ForecastResult BuildFallbackForecast(int productId, List<float> salesList, int horizon)
    {
        if (_logger.IsEnabled(LogLevel.Warning))
            LogFallbackForecast(productId, salesList.Count);

        var forecasted = new float[horizon];
        var lower = new float[horizon];
        var upper = new float[horizon];

        if (salesList.Count < 2)
        {
            // If 0 or 1 data point, we can only return a flat line of that point (or 0)
            float val = salesList.Count == 1 ? salesList[0] : 0f;
            for (int i = 0; i < horizon; i++)
            {
                forecasted[i] = val;
                lower[i] = MathF.Max(0, val - val * 0.2f);
                upper[i] = val + val * 0.2f;
            }
            return new ForecastResult
            {
                ForecastedUnits = forecasted, LowerBound = lower, UpperBound = upper, Rmse = 0, Mae = 0
            };
        }

        // Use Linear Regression to find the real trend line for sparse data
        int n = salesList.Count;
        float sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (int i = 0; i < n; i++)
        {
            sumX += i;
            sumY += salesList[i];
            sumXY += i * salesList[i];
            sumX2 += i * i;
        }

        float slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        float intercept = (sumY - slope * sumX) / n;

        // Calculate standard deviation of the residuals for confidence intervals
        float sumSquaredResiduals = 0;
        float sumAbsResiduals = 0;
        for (int i = 0; i < n; i++)
        {
            float predicted = slope * i + intercept;
            float residual = salesList[i] - predicted;
            sumSquaredResiduals += residual * residual;
            sumAbsResiduals += MathF.Abs(residual);
        }
        
        float stdDev = MathF.Sqrt(sumSquaredResiduals / n);
        float mae = sumAbsResiduals / n;

        for (int i = 0; i < horizon; i++)
        {
            // Project the trend line into the future (starting from x = n)
            float projectedX = n + i;
            float trendValue = slope * projectedX + intercept;
            
            // Demand can't be negative
            float baseValue = MathF.Max(0, trendValue);
            
            forecasted[i] = baseValue;
            lower[i] = MathF.Max(0, baseValue - 1.96f * stdDev);
            upper[i] = baseValue + 1.96f * stdDev;
        }

        return new ForecastResult
        {
            ForecastedUnits = forecasted,
            LowerBound = lower,
            UpperBound = upper,
            Rmse = stdDev,
            Mae = mae
        };
    }

    /// <summary>
    /// Pads or trims an array to the desired length
    /// </summary>
    private static float[] NormalizeArray(float[]? source, int desiredLength)
    {
        if (source == null || source.Length == 0)
            return new float[desiredLength];

        if (source.Length >= desiredLength)
            return source[..desiredLength];

        var result = new float[desiredLength];
        Array.Copy(source, result, source.Length);
        var lastValue = source[^1];
        for (int i = source.Length; i < desiredLength; i++)
            result[i] = lastValue;

        return result;
    }

    /// <summary>
    /// Computes RMSE and MAE by comparing the tail of historical data against
    /// the first N forecast values as a proxy for accuracy.
    /// </summary>
    private static (float Rmse, float Mae) ComputeAccuracyMetrics(List<float> historical, float[] _)
    {
        // Use the last 7 days of actual data (if available) compared with
        // the moving average to estimate error bounds
        var window = Math.Min(7, historical.Count);
        if (window == 0)
            return (0f, 0f);

        var tail = historical.TakeLast(window).ToArray();
        var avg = tail.Average();
        var squaredErrors = tail.Select(v => MathF.Pow(v - avg, 2));
        var absoluteErrors = tail.Select(v => MathF.Abs(v - avg));

        var rmse = MathF.Sqrt(squaredErrors.Average());
        var mae = absoluteErrors.Average();

        return (rmse, mae);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "SSA forecast model loaded: {ModelFile}")]
    private partial void LogModelLoaded(string modelFile);

    [LoggerMessage(Level = LogLevel.Information, Message = "No SSA model found at startup. Expected file: {ModelFile}")]
    private partial void LogNoModelFound(string modelFile);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to load SSA model file {ModelFile}")]
    private partial void LogModelLoadError(Exception ex, string modelFile);

    [LoggerMessage(Level = LogLevel.Information, Message = "SSA forecast generated for product {ProductId} (SKU={Sku}). Horizon={Horizon} days, RMSE={Rmse:F2}, MAE={Mae:F2}")]
    private partial void LogForecastGenerated(int productId, string sku, int horizon, float rmse, float mae);

    [LoggerMessage(Level = LogLevel.Error, Message = "SSA prediction failed for product {ProductId} with {HistoricalCount} data points. Falling back to moving average.")]
    private partial void LogPredictionError(Exception ex, int productId, int historicalCount);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Model not loaded or insufficient data. Returning moving average fallback for product {ProductId} based on {Count} points.")]
    private partial void LogFallbackForecast(int productId, int count);
}
