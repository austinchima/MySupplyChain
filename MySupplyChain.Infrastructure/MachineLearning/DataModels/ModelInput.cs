using Microsoft.ML.Data;

namespace MySupplyChain.Infrastructure.MachineLearning.DataModels;

/// <summary>
/// Input schema for ML.NET model training and predictions
/// Matches the structure of sales_data.csv
/// </summary>
public class ModelInput
{
    [LoadColumn(0)]
    public float ProductId { get; set; }

    [LoadColumn(1)]
    public string Sku { get; set; } = string.Empty;

    [LoadColumn(2)]
    public string Date { get; set; } = string.Empty;

    [LoadColumn(3)]
    public float QuantitySold { get; set; }

    [LoadColumn(4)]
    public float Price { get; set; }

    [LoadColumn(5)]
    public float DayOfWeek { get; set; }

    [LoadColumn(6)]
    public float Month { get; set; }
}
