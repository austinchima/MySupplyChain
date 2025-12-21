using Microsoft.ML;
using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.ModelTrainer;

/// <summary>
/// Console app to train the ML.NET demand forecasting model with realistic data
/// </summary>
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("🤖 MySupplyChain - Advanced ML Model Trainer");
        Console.WriteLine("=============================================\n");

        var mlContext = new MLContext(seed: 0);
        
        // Parse command line arguments
        var useExistingData = args.Contains("--use-existing");
        var algorithm = GetAlgorithm(args);
        var dataPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "sales_data.csv");

        IDataView dataView;
        
        if (useExistingData && File.Exists(dataPath))
        {
            Console.WriteLine("📊 Loading existing training data...");
            dataView = mlContext.Data.LoadFromTextFile<ModelInput>(
                path: dataPath,
                hasHeader: true,
                separatorChar: ',');
        }
        else
        {
            Console.WriteLine("🎲 Generating realistic historical sales data...");
            
            // Generate 5 years of data with all features
            var startDate = DateTime.Now.AddYears(-2);
            var trainingData = DataGenerator.GenerateHistoricalData(
                startDate: startDate,
                days: 365*15, // 15 years
                includeSeasonality: true,
                includePromotions: true,
                includeStockouts: true
            );

            // Export to CSV for future use
            DataGenerator.ExportToCsv(trainingData, dataPath);
            
            // Load into ML.NET
            dataView = mlContext.Data.LoadFromEnumerable(trainingData);
        }

        var rowCount = mlContext.Data.CreateEnumerable<ModelInput>(dataView, reuseRowObject: false).Count();
        Console.WriteLine($"✓ Loaded {rowCount} training records\n");

        // Split data for training and evaluation
        var trainTestSplit = mlContext.Data.TrainTestSplit(dataView, testFraction: 0.2);
        var trainData = trainTestSplit.TrainSet;
        var testData = trainTestSplit.TestSet;

        // Build and train model
        var model = BuildAndTrainModel(mlContext, trainData, algorithm);
        
        // Evaluate model
        EvaluateModel(mlContext, model, testData);
        
        // Save the model
        SaveModel(mlContext, model, dataView);
        
        // Test predictions
        TestPredictions(mlContext, model);

        Console.WriteLine("\n✅ Training complete! You can now use this model in the API.\n");
    }

    /// <summary>
    /// Builds and trains the ML model with the specified algorithm
    /// </summary>
    static ITransformer BuildAndTrainModel(MLContext mlContext, IDataView trainData, string algorithm)
    {
        Console.WriteLine($"🔧 Building ML pipeline with {algorithm} algorithm...");

        // Feature engineering pipeline
        var pipeline = mlContext.Transforms.CopyColumns("Label", nameof(ModelInput.QuantitySold))
            .Append(mlContext.Transforms.Concatenate("Features",
                nameof(ModelInput.ProductId),
                nameof(ModelInput.Price),
                nameof(ModelInput.DayOfWeek),
                nameof(ModelInput.Month)))
            .Append(mlContext.Transforms.NormalizeMinMax("Features"));

        // Add the selected algorithm
        IEstimator<ITransformer> trainer;
        switch (algorithm.ToLower())
        {
            case "lightgbm":
                trainer = mlContext.Regression.Trainers.LightGbm(
                    labelColumnName: "Label",
                    featureColumnName: "Features",
                    numberOfLeaves: 50,
                    minimumExampleCountPerLeaf: 10,
                    learningRate: 0.1);
                break;
                
            case "fasttree":
                trainer = mlContext.Regression.Trainers.FastTree(
                    labelColumnName: "Label",
                    featureColumnName: "Features",
                    numberOfLeaves: 50,
                    minimumExampleCountPerLeaf: 10,
                    learningRate: 0.1);
                break;
                
            case "fastforest":
                trainer = mlContext.Regression.Trainers.FastForest(
                    labelColumnName: "Label",
                    featureColumnName: "Features",
                    numberOfTrees: 100,
                    numberOfLeaves: 50);
                break;
                
            case "sdca":
                trainer = mlContext.Regression.Trainers.Sdca(
                    labelColumnName: "Label",
                    featureColumnName: "Features");
                break;
                
            default:
                trainer = mlContext.Regression.Trainers.LightGbm(
                    labelColumnName: "Label",
                    featureColumnName: "Features");
                break;
        }

        var fullPipeline = pipeline.Append(trainer);
        Console.WriteLine("✓ Pipeline configured\n");

        // Train the model
        Console.WriteLine("🎯 Training model...");
        var model = fullPipeline.Fit(trainData);
        Console.WriteLine("✓ Training complete!\n");

        return model;
    }

    /// <summary>
    /// Evaluates the trained model and prints metrics
    /// </summary>
    static void EvaluateModel(MLContext mlContext, ITransformer model, IDataView testData)
    {
        Console.WriteLine("📊 Evaluating model performance...");
        
        var predictions = model.Transform(testData);
        var metrics = mlContext.Regression.Evaluate(predictions);

        Console.WriteLine("📈 Model Evaluation Metrics:");
        Console.WriteLine("============================");
        Console.WriteLine($"R-Squared (R²):           {metrics.RSquared:F4}");
        Console.WriteLine($"Mean Absolute Error:      {metrics.MeanAbsoluteError:F2}");
        Console.WriteLine($"Mean Squared Error:       {metrics.MeanSquaredError:F2}");
        Console.WriteLine($"Root Mean Squared Error:  {metrics.RootMeanSquaredError:F2}");
        Console.WriteLine($"Loss Function:            {metrics.LossFunction:F2}");

        // Interpretation
        Console.WriteLine("\n🎯 Model Quality Assessment:");
        if (metrics.RSquared >= 0.8)
            Console.WriteLine("✅ Excellent model (R² ≥ 0.8)");
        else if (metrics.RSquared >= 0.6)
            Console.WriteLine("✅ Good model (R² ≥ 0.6)");
        else if (metrics.RSquared >= 0.4)
            Console.WriteLine("⚠️  Fair model (R² ≥ 0.4) - consider more data or features");
        else
            Console.WriteLine("❌ Poor model (R² < 0.4) - needs improvement");

        Console.WriteLine($"📊 On average, predictions are off by {metrics.MeanAbsoluteError:F1} units");
        Console.WriteLine();
    }

    /// <summary>
    /// Saves the trained model
    /// </summary>
    static void SaveModel(MLContext mlContext, ITransformer model, IDataView dataView)
    {
        var solutionRoot = GetSolutionRoot();
        var outputPath = Path.Combine(solutionRoot, "MySupplyChain.Infrastructure", "MLModels", "sales_model.zip");

        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        mlContext.Model.Save(model, dataView.Schema, outputPath);

        Console.WriteLine($"💾 Model saved to: {outputPath}");
    }

    /// <summary>
    /// Tests the model with sample predictions
    /// </summary>
    static void TestPredictions(MLContext mlContext, ITransformer model)
    {
        Console.WriteLine("🧪 Testing sample predictions...");
        
        var predictionEngine = mlContext.Model.CreatePredictionEngine<ModelInput, ModelOutput>(model);

        var testCases = new[]
        {
            new ModelInput { ProductId = 1, Price = 1299.99f, DayOfWeek = 2, Month = 11 }, // Laptop, Tuesday, November
            new ModelInput { ProductId = 3, Price = 29.99f, DayOfWeek = 5, Month = 12 },   // Mouse, Friday, December
            new ModelInput { ProductId = 2, Price = 299.99f, DayOfWeek = 1, Month = 6 },   // Printer, Monday, June
        };

        Console.WriteLine("Sample Predictions:");
        Console.WriteLine("==================");
        
        foreach (var testCase in testCases)
        {
            var prediction = predictionEngine.Predict(testCase);
            Console.WriteLine($"Product {testCase.ProductId} (${testCase.Price}, {GetDayName((int)testCase.DayOfWeek)}, Month {testCase.Month}): {prediction.PredictedDemand:F1} units");
        }
        
        Console.WriteLine();
    }

    /// <summary>
    /// Gets algorithm from command line arguments
    /// </summary>
    static string GetAlgorithm(string[] args)
    {
        var algorithmArg = args.FirstOrDefault(arg => arg.StartsWith("--algorithm="));
        return algorithmArg?.Split('=')[1] ?? "lightgbm";
    }

    /// <summary>
    /// Gets day name from day of week number
    /// </summary>
    static string GetDayName(int dayOfWeek)
    {
        return ((DayOfWeek)dayOfWeek).ToString();
    }

    /// <summary>
    /// Finds the solution root directory
    /// </summary>
    static string GetSolutionRoot()
    {
        var directory = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        while (directory != null && directory.GetFiles("*.slnx").Length == 0 && directory.GetFiles("*.sln").Length == 0)
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new Exception("Could not find solution root");
    }
}
