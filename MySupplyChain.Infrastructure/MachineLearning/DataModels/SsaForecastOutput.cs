using Microsoft.ML.Data;

namespace MySupplyChain.Infrastructure.MachineLearning.DataModels;

/// <summary>
/// Input schema for SSA time series model.
/// Each row represents one daily observation for a single product.
/// </summary>
public class SsaModelInput
{
    /// <summary>
    /// Daily units sold — the time series value being forecasted
    /// </summary>
    [LoadColumn(0)]
    public float UnitsSold { get; set; }
}

/// <summary>
/// Output schema for SSA time series forecasting.
/// Contains multi-horizon point forecasts and confidence intervals.
/// </summary>
public class SsaForecastOutput
{
    /// <summary>
    /// Point forecast for each day in the horizon
    /// </summary>
    public float[] ForecastedUnits { get; set; } = [];

    /// <summary>
    /// Lower 95% confidence bound for each day
    /// </summary>
    public float[] LowerBound { get; set; } = [];

    /// <summary>
    /// Upper 95% confidence bound for each day
    /// </summary>
    public float[] UpperBound { get; set; } = [];
}
