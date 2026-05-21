using Microsoft.ML;
using Microsoft.ML.Transforms.TimeSeries;
using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.ModelTrainer;

class Program
{
    private const int DefaultHorizon = 30;
    private const int DefaultWindowSize = 7;
    private const int DefaultSeriesLength = 365;
    private const float ConfidenceLevel = 0.95f;

    static void Main(string[] args)
    {
        Console.WriteLine("🤖 MySupplyChain — SSA Time Series Model Trainer");
        Console.WriteLine("=================================================\n");

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

        // Load CSV: date,store,item,sales
        var rawData = LoadTimeSeriesData(dataPath);
        Console.WriteLine($"✓ Loaded {rawData.Count} daily records across {rawData.Select(r => r.Item).Distinct().Count()} products\n");

        // Train a separate SSA model per product for maximum accuracy
        var products = rawData.Select(r => r.Item).Distinct().OrderBy(x => x).ToList();

        foreach (var productId in products)
        {
            Console.WriteLine($"\n{'=',-50}");
            Console.WriteLine($"📦 Training SSA model for Product {productId}");
            Console.WriteLine($"{'=',-50}");

            var productData = rawData
                .Where(r => r.Item == productId)
                .OrderBy(r => r.Date)
                .Select(r => new SsaModelInput { UnitsSold = r.Sales })
                .ToList();

            Console.WriteLine($"  • Time series length: {productData.Count} days");
            Console.WriteLine($"  • Date range: {rawData.Where(r => r.Item == productId).Min(r => r.Date):yyyy-MM-dd} → " +
                            $"{rawData.Where(r => r.Item == productId).Max(r => r.Date):yyyy-MM-dd}");

            // Split: 80% train, 20% evaluation
            var splitPoint = (int)(productData.Count * 0.8);
            var trainData = productData.Take(splitPoint).ToList();
            var evalData = productData.Skip(splitPoint).ToList();

            Console.WriteLine($"  • Train set: {trainData.Count} days | Eval set: {evalData.Count} days");

            var dataView = mlContext.Data.LoadFromEnumerable(trainData);

            var windowSize = Math.Min(DefaultWindowSize, trainData.Count / 4);
            var seriesLength = Math.Min(DefaultSeriesLength, trainData.Count);

            Console.WriteLine($"  • SSA params: windowSize={windowSize}, seriesLength={seriesLength}, horizon={DefaultHorizon}");

            // Build SSA pipeline
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

            Console.Write("  ⏳ Training...");
            var model = pipeline.Fit(dataView);
            Console.WriteLine(" ✅ Done");

            // Evaluate on hold-out set
            EvaluateModel(mlContext, model, evalData, productId);

            // Save model
            SaveModel(mlContext, model, dataView, productId);

            // Test predictions
            TestPredictions(mlContext, model, productId);
        }

        // Also save a combined "default" model using all products aggregated
        Console.WriteLine("\n\n📊 Training aggregated default model (all products)...");
        var allSales = rawData
            .GroupBy(r => r.Date)
            .OrderBy(g => g.Key)
            .Select(g => new SsaModelInput { UnitsSold = g.Sum(x => x.Sales) })
            .ToList();

        var defaultView = mlContext.Data.LoadFromEnumerable(allSales);
        var defaultPipeline = mlContext.Forecasting.ForecastBySsa(
            outputColumnName: nameof(SsaForecastOutput.ForecastedUnits),
            inputColumnName: nameof(SsaModelInput.UnitsSold),
            windowSize: DefaultWindowSize,
            seriesLength: Math.Min(DefaultSeriesLength, allSales.Count),
            trainSize: allSales.Count,
            horizon: DefaultHorizon,
            confidenceLevel: ConfidenceLevel,
            confidenceLowerBoundColumn: nameof(SsaForecastOutput.LowerBound),
            confidenceUpperBoundColumn: nameof(SsaForecastOutput.UpperBound));

        var defaultModel = defaultPipeline.Fit(defaultView);

        var solutionRoot = GetSolutionRoot();
        var defaultPath = Path.Combine(solutionRoot, "MySupplyChain.Infrastructure", "MLModels", "sales_model.zip");
        Directory.CreateDirectory(Path.GetDirectoryName(defaultPath)!);
        mlContext.Model.Save(defaultModel, defaultView.Schema, defaultPath);
        Console.WriteLine($"  💾 Default model saved: {defaultPath}");

        Console.WriteLine("\n\n✅ All SSA models trained and saved successfully!");
        Console.WriteLine("   You can now run the API with demand forecasting enabled.\n");
    }

    static void EvaluateModel(MLContext mlContext, ITransformer model, List<SsaModelInput> evalData, int productId)
    {
        var engine = model.CreateTimeSeriesEngine<SsaModelInput, SsaForecastOutput>(mlContext);
        var prediction = engine.Predict();

        var horizon = Math.Min(prediction.ForecastedUnits.Length, evalData.Count);
        if (horizon == 0)
        {
            Console.WriteLine("  ⚠️ No evaluation data available");
            return;
        }

        var actuals = evalData.Take(horizon).Select(e => e.UnitsSold).ToArray();
        var predicted = prediction.ForecastedUnits.Take(horizon).ToArray();

        var mse = actuals.Zip(predicted, (a, p) => MathF.Pow(a - p, 2)).Average();
        var rmse = MathF.Sqrt(mse);
        var mae = actuals.Zip(predicted, (a, p) => MathF.Abs(a - p)).Average();
        var meanActual = actuals.Average();
        var ssTot = actuals.Sum(a => MathF.Pow(a - meanActual, 2));
        var ssRes = actuals.Zip(predicted, (a, p) => MathF.Pow(a - p, 2)).Sum();
        var r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

        Console.WriteLine($"\n  📈 Evaluation (Product {productId}, {horizon}-day holdout):");
        Console.WriteLine($"     R²   = {r2:F4}");
        Console.WriteLine($"     RMSE = {rmse:F2}");
        Console.WriteLine($"     MAE  = {mae:F2}");
        Console.WriteLine($"     MSE  = {mse:F2}");

        var quality = r2 switch
        {
            >= 0.7f => "🟢 Good",
            >= 0.4f => "🟡 Fair",
            _ => "🔴 Poor"
        };
        Console.WriteLine($"     Quality: {quality}");
    }

    static void SaveModel(MLContext mlContext, ITransformer model, IDataView dataView, int productId)
    {
        var solutionRoot = GetSolutionRoot();
        var outputPath = Path.Combine(solutionRoot, "MySupplyChain.Infrastructure", "MLModels", $"ssa_product_{productId}.zip");
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        mlContext.Model.Save(model, dataView.Schema, outputPath);
        Console.WriteLine($"  💾 Model saved: {outputPath}");
    }

    static void TestPredictions(MLContext mlContext, ITransformer model, int productId)
    {
        var engine = model.CreateTimeSeriesEngine<SsaModelInput, SsaForecastOutput>(mlContext);
        var prediction = engine.Predict();

        Console.WriteLine($"\n  🔮 {DefaultHorizon}-Day Forecast (Product {productId}):");
        Console.WriteLine($"     {"Day",-5} {"Forecast",-10} {"Lower",-10} {"Upper",-10}");
        Console.WriteLine($"     {new string('-', 35)}");

        for (int i = 0; i < Math.Min(7, prediction.ForecastedUnits.Length); i++)
        {
            var f = MathF.Max(0, prediction.ForecastedUnits[i]);
            var l = MathF.Max(0, prediction.LowerBound[i]);
            var u = MathF.Max(0, prediction.UpperBound[i]);
            Console.WriteLine($"     {i + 1,-5} {f,-10:F1} {l,-10:F1} {u,-10:F1}");
        }

        if (prediction.ForecastedUnits.Length > 7)
            Console.WriteLine($"     ... ({prediction.ForecastedUnits.Length - 7} more days)");

        var total = prediction.ForecastedUnits.Select(x => MathF.Max(0, x)).Sum();
        Console.WriteLine($"\n     Total {DefaultHorizon}-day forecast: {total:F1} units");
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
