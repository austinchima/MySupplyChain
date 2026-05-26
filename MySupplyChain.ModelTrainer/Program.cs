using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Transforms.TimeSeries;
using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.ModelTrainer;

class Program
{
    private const int DefaultHorizon = 30;
    private const int DefaultWindowSize = 60;
    private const int LgbmWindowSize = 30; // Features for LightGBM
    private const int DefaultSeriesLength = 365;
    private const float ConfidenceLevel = 0.95f;

    static void Main(string[] args)
    {
        Console.WriteLine("🤖 MySupplyChain — ML Model Trainer (SSA vs LightGBM)");
        Console.WriteLine("=====================================================\n");

        var mlContext = new MLContext(seed: 0);
        var dataPath = args.FirstOrDefault(a => a.StartsWith("--data="))?.Split('=')[1]
                       ?? Path.Combine(GetSolutionRoot(), "data", "train.csv");

        if (!File.Exists(dataPath))
        {
            Console.WriteLine($"📊 Training data not found at {dataPath}");
            Console.WriteLine("🎲 Generating synthetic time series data...\n");
            Directory.CreateDirectory(Path.GetDirectoryName(dataPath)!);
            TimeSeriesDataGenerator.GenerateAndExport(dataPath);
        }

        Console.WriteLine($"📂 Loading data from: {dataPath}");
        var rawData = LoadTimeSeriesData(dataPath);
        Console.WriteLine($"✓ Loaded {rawData.Count} daily records across {rawData.Select(r => r.Item).Distinct().Count()} products\n");

        var products = rawData.Select(r => r.Item).Distinct().OrderBy(x => x).ToList();

        var ssaMetrics = new List<ModelMetrics>();
        var lgbmMetrics = new List<ModelMetrics>();

        foreach (var productId in products)
        {
            Console.WriteLine($"\n{'=',-50}");
            Console.WriteLine($"📦 Training models for Product {productId}");
            Console.WriteLine($"{'=',-50}");

            var productData = rawData
                .Where(r => r.Item == productId)
                .GroupBy(r => r.Date)
                .OrderBy(g => g.Key)
                .Select(g => new SsaModelInput { UnitsSold = g.Sum(r => r.Sales) })
                .ToList();

            var splitPoint = (int)(productData.Count * 0.8);
            var trainData = productData.Take(splitPoint).ToList();
            var evalData = productData.Skip(splitPoint).ToList();

            // 1. Train SSA
            var ssaModel = TrainSsa(mlContext, trainData);
            var ssaResult = EvaluateSsa(mlContext, ssaModel, evalData, productId);
            ssaMetrics.Add(ssaResult);

            // 2. Train LightGBM
            var lgbmModel = TrainLightGbm(mlContext, trainData, LgbmWindowSize);
            var lgbmResult = EvaluateLightGbm(mlContext, lgbmModel, trainData, evalData, LgbmWindowSize, productId);
            lgbmMetrics.Add(lgbmResult);
        }

        // Print final report
        PrintComparisonReport(ssaMetrics, lgbmMetrics);
    }

    static ITransformer TrainSsa(MLContext mlContext, List<SsaModelInput> trainData)
    {
        var windowSize = Math.Min(DefaultWindowSize, trainData.Count / 4);
        var seriesLength = Math.Min(DefaultSeriesLength, trainData.Count);

        var dataView = mlContext.Data.LoadFromEnumerable(trainData);
        var pipeline = mlContext.Forecasting.ForecastBySsa(
            outputColumnName: nameof(SsaForecastOutput.ForecastedUnits),
            inputColumnName: nameof(SsaModelInput.UnitsSold),
            windowSize: windowSize,
            seriesLength: seriesLength,
            trainSize: trainData.Count,
            horizon: DefaultHorizon,
            confidenceLevel: ConfidenceLevel,
            confidenceLowerBoundColumn: nameof(SsaForecastOutput.LowerBound),
            confidenceUpperBoundColumn: nameof(SsaForecastOutput.UpperBound));

        Console.Write("  ⏳ Training SSA...");
        var model = pipeline.Fit(dataView);
        Console.WriteLine(" ✅ Done");
        return model;
    }

    static ModelMetrics EvaluateSsa(MLContext mlContext, ITransformer model, List<SsaModelInput> evalData, int productId)
    {
        var engine = model.CreateTimeSeriesEngine<SsaModelInput, SsaForecastOutput>(mlContext);
        var prediction = engine.Predict();

        var horizon = Math.Min(prediction.ForecastedUnits.Length, evalData.Count);
        if (horizon == 0) return new ModelMetrics();

        var actuals = evalData.Take(horizon).Select(e => e.UnitsSold).ToArray();
        var predicted = prediction.ForecastedUnits.Take(horizon).Select(x => MathF.Max(0, x)).ToArray();

        return CalculateMetrics("SSA", actuals, predicted);
    }

    static ITransformer TrainLightGbm(MLContext mlContext, List<SsaModelInput> trainData, int windowSize)
    {
        var lgbmInputs = CreateLagFeatures(trainData, windowSize);
        var dataView = mlContext.Data.LoadFromEnumerable(lgbmInputs);

        var pipeline = mlContext.Transforms.CopyColumns("Label", nameof(LightGbmModelInput.Label))
            .Append(mlContext.Regression.Trainers.LightGbm(new Microsoft.ML.Trainers.LightGbm.LightGbmRegressionTrainer.Options
            {
                LabelColumnName = "Label",
                FeatureColumnName = nameof(LightGbmModelInput.Features),
                NumberOfLeaves = 31,
                MinimumExampleCountPerLeaf = 5,
                LearningRate = 0.1,
                NumberOfIterations = 100
            }));

        Console.Write("  ⏳ Training LightGBM...");
        var model = pipeline.Fit(dataView);
        Console.WriteLine(" ✅ Done");
        return model;
    }

    static ModelMetrics EvaluateLightGbm(MLContext mlContext, ITransformer model, List<SsaModelInput> trainData, List<SsaModelInput> evalData, int windowSize, int productId)
    {
        var engine = mlContext.Model.CreatePredictionEngine<LightGbmModelInput, LightGbmModelOutput>(model);

        var horizon = Math.Min(DefaultHorizon, evalData.Count);
        if (horizon == 0) return new ModelMetrics();

        // Seed with the last 'windowSize' elements of the training set
        var currentWindow = trainData.TakeLast(windowSize).Select(x => x.UnitsSold).ToList();
        var predicted = new float[horizon];

        for (int i = 0; i < horizon; i++)
        {
            var input = new LightGbmModelInput { Features = currentWindow.ToArray() };
            var pred = engine.Predict(input);
            var val = MathF.Max(0, pred.Score);
            predicted[i] = val;

            // Slide window
            currentWindow.RemoveAt(0);
            currentWindow.Add(val);
        }

        var actuals = evalData.Take(horizon).Select(e => e.UnitsSold).ToArray();

        return CalculateMetrics("LightGBM", actuals, predicted);
    }

    static List<LightGbmModelInput> CreateLagFeatures(List<SsaModelInput> timeSeries, int windowSize)
    {
        var inputs = new List<LightGbmModelInput>();
        for (int i = windowSize; i < timeSeries.Count; i++)
        {
            var features = new float[windowSize];
            for (int j = 0; j < windowSize; j++)
            {
                features[j] = timeSeries[i - windowSize + j].UnitsSold;
            }
            inputs.Add(new LightGbmModelInput
            {
                Features = features,
                Label = timeSeries[i].UnitsSold
            });
        }
        return inputs;
    }

    static ModelMetrics CalculateMetrics(string modelName, float[] actuals, float[] predicted)
    {
        var mse = actuals.Zip(predicted, (a, p) => MathF.Pow(a - p, 2)).Average();
        var rmse = MathF.Sqrt(mse);
        var mae = actuals.Zip(predicted, (a, p) => MathF.Abs(a - p)).Average();
        var meanActual = actuals.Average();
        var ssTot = actuals.Sum(a => MathF.Pow(a - meanActual, 2));
        var ssRes = actuals.Zip(predicted, (a, p) => MathF.Pow(a - p, 2)).Sum();
        var r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

        Console.WriteLine($"  📈 {modelName} Metrics (30-day holdout):");
        Console.WriteLine($"     R²   = {r2:F4} | RMSE = {rmse:F2} | MAE  = {mae:F2}");

        return new ModelMetrics { ModelName = modelName, R2 = r2, Rmse = rmse, Mae = mae };
    }

    static void PrintComparisonReport(List<ModelMetrics> ssaMetrics, List<ModelMetrics> lgbmMetrics)
    {
        Console.WriteLine("\n\n📊 FINAL COMPARISON REPORT: SSA vs LightGBM");
        Console.WriteLine("===========================================");
        Console.WriteLine("Averaged across all products for a 30-day prediction horizon.\n");

        var avgSsaRmse = ssaMetrics.Average(m => m.Rmse);
        var avgSsaMae = ssaMetrics.Average(m => m.Mae);
        var avgSsaR2 = ssaMetrics.Average(m => m.R2);

        var avgLgbmRmse = lgbmMetrics.Average(m => m.Rmse);
        var avgLgbmMae = lgbmMetrics.Average(m => m.Mae);
        var avgLgbmR2 = lgbmMetrics.Average(m => m.R2);

        Console.WriteLine($"| Metric | SSA (Current) | LightGBM (Proposed) | Improvement |");
        Console.WriteLine($"|--------|---------------|---------------------|-------------|");
        Console.WriteLine($"| RMSE   | {avgSsaRmse,13:F2} | {avgLgbmRmse,19:F2} | {((avgSsaRmse - avgLgbmRmse) / avgSsaRmse * 100),10:F1}% |");
        Console.WriteLine($"| MAE    | {avgSsaMae,13:F2} | {avgLgbmMae,19:F2} | {((avgSsaMae - avgLgbmMae) / avgSsaMae * 100),10:F1}% |");
        Console.WriteLine($"| R²     | {avgSsaR2,13:F4} | {avgLgbmR2,19:F4} | {(avgLgbmR2 - avgSsaR2),11:F4} |");
        
        Console.WriteLine("\n✅ Model training and comparison completed.");
    }

    static List<TimeSeriesRecord> LoadTimeSeriesData(string path)
    {
        var records = new List<TimeSeriesRecord>();
        foreach (var line in File.ReadLines(path).Skip(1)) // Skip header
        {
            var parts = line.Split(',');
            if (parts.Length >= 4 &&
                DateTime.TryParse(parts[0], out var date) &&
                int.TryParse(parts[1], out var store) &&
                int.TryParse(parts[2], out var item) &&
                float.TryParse(parts[3], out var sales))
            {
                records.Add(new TimeSeriesRecord(date, store, item, sales));
            }
        }
        return records;
    }

    static string GetSolutionRoot()
    {
        var directory = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        while (directory != null && directory.GetFiles("*.slnx").Length == 0 && directory.GetFiles("*.sln").Length == 0)
            directory = directory.Parent;
        return directory?.FullName ?? throw new Exception("Could not find solution root");
    }
}

record TimeSeriesRecord(DateTime Date, int Store, int Item, float Sales);

public class LightGbmModelInput
{
    [VectorType(30)]
    public float[] Features { get; set; } = new float[30];
    public float Label { get; set; }
}

public class LightGbmModelOutput
{
    [ColumnName("Score")]
    public float Score { get; set; }
}

public struct ModelMetrics
{
    public string ModelName { get; set; }
    public float R2 { get; set; }
    public float Rmse { get; set; }
    public float Mae { get; set; }
}
