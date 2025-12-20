using Microsoft.ML;
using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.ModelTrainer;

/// <summary>
/// Console app to train the ML.NET demand forecasting model
/// </summary>
class Program
{
    static void Main()
    {
        Console.WriteLine("🤖 MySupplyChain - ML Model Trainer");
        Console.WriteLine("====================================\n");

        var mlContext = new MLContext(seed: 0);

        // 1. Load data
        Console.WriteLine("📊 Loading training data...");
        var dataPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "sales_data.csv");

        var dataView = mlContext.Data.LoadFromTextFile<ModelInput>(
            path: dataPath,
            hasHeader: true,
            separatorChar: ',');

        // Get row count by enumerating (GetRowCount extension may not be available in this ML.NET version)
        var rowCount = mlContext.Data.CreateEnumerable<ModelInput>(dataView, reuseRowObject: false).Count();
        Console.WriteLine($"✓ Loaded {rowCount} training records\n");

        // 2. Build training pipeline
        Console.WriteLine("🔧 Building ML pipeline...");
        var pipeline = mlContext.Transforms.Concatenate("Features",
                nameof(ModelInput.ProductId),
                nameof(ModelInput.QuantitySold),
                nameof(ModelInput.DayOfWeek),
                nameof(ModelInput.Month))
            .Append(mlContext.Regression.Trainers.Sdca(
                labelColumnName: nameof(ModelInput.QuantitySold),
                featureColumnName: "Features"));

        Console.WriteLine("✓ Pipeline configured\n");

        // 3. Train the model
        Console.WriteLine("🎯 Training model...");
        var model = pipeline.Fit(dataView);
        Console.WriteLine("✓ Training complete!\n");

        // 4. Save the model
        var solutionRoot = GetSolutionRoot();
        var outputPath = Path.Combine(solutionRoot, "MySupplyChain.Infrastructure", "MLModels", "sales_model.zip");

        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        mlContext.Model.Save(model, dataView.Schema, outputPath);

        Console.WriteLine($"💾 Model saved to: {outputPath}");
        Console.WriteLine("\n✅ Training complete! You can now use this model in the API.\n");
    }

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
