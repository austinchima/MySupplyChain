using Microsoft.ML.Data;

namespace MySupplyChain.Infrastructure.MachineLearning.DataModels;

/// <summary>
/// Output schema for ML.NET predictions
/// </summary>
public class ModelOutput
{
    [ColumnName("Score")]
    public float PredictedDemand { get; set; }
}
