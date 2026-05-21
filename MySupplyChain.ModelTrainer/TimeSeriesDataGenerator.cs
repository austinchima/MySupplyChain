namespace MySupplyChain.ModelTrainer;

/// <summary>
/// Generates realistic time series data matching the Kaggle "Store Item Demand Forecasting" schema:
/// date, store, item, sales
/// </summary>
public static class TimeSeriesDataGenerator
{
    private static readonly Random Rng = new(42); // Fixed seed for reproducibility

    /// <summary>
    /// Product definitions with realistic demand characteristics
    /// </summary>
    private static readonly (int ItemId, string Name, float BaseDemand, float Volatility, float TrendSlope)[] Products =
    [
        (1, "Dell Laptop XPS 13",          8f,  0.25f, 0.005f),
        (2, "iPhone 15 Pro",              15f,  0.30f, 0.008f),
        (3, "Wireless Mouse",             45f,  0.35f, 0.003f),
        (4, "Samsung 27\" Monitor",       12f,  0.20f, 0.004f),
        (5, "Sony WH-1000XM5 Headphones", 20f,  0.28f, 0.006f),
    ];

    /// <summary>
    /// Generates and exports a CSV file with realistic daily sales data
    /// </summary>
    /// <param name="outputPath">Path to write the CSV file</param>
    /// <param name="days">Number of days of history to generate (default 730 = 2 years)</param>
    public static void GenerateAndExport(string outputPath, int days = 730)
    {
        Console.WriteLine($"📊 Generating {days} days of time series data for {Products.Length} products...");

        var startDate = DateTime.Today.AddDays(-days);
        using var writer = new StreamWriter(outputPath);
        writer.WriteLine("date,store,item,sales");

        int totalRecords = 0;

        foreach (var (itemId, name, baseDemand, volatility, trendSlope) in Products)
        {
            Console.Write($"  • Product {itemId} ({name}): ");

            for (int day = 0; day < days; day++)
            {
                var date = startDate.AddDays(day);
                var sales = GenerateDailySales(baseDemand, volatility, trendSlope, day, date);
                writer.WriteLine($"{date:yyyy-MM-dd},1,{itemId},{sales:F0}");
                totalRecords++;
            }

            Console.WriteLine($"{days} days generated");
        }

        Console.WriteLine($"\n✅ Exported {totalRecords} records to {outputPath}");
    }

    /// <summary>
    /// Generates a single day's sales with trend, seasonality, day-of-week, and noise
    /// </summary>
    private static float GenerateDailySales(float baseDemand, float volatility, float trendSlope, int dayIndex, DateTime date)
    {
        // Linear trend
        var trend = baseDemand * (1 + trendSlope * dayIndex);

        // Annual seasonality (holiday peak in Nov-Dec, summer dip)
        var dayOfYear = date.DayOfYear;
        var annualSeason = 1.0f + 0.3f * MathF.Sin(2 * MathF.PI * (dayOfYear - 320) / 365f);

        // Holiday spikes
        if (dayOfYear >= 320 && dayOfYear <= 360) // Nov 16 - Dec 26
            annualSeason += 0.5f + (float)Rng.NextDouble() * 0.3f;

        // Back-to-school (Aug-Sep)
        if (dayOfYear >= 213 && dayOfYear <= 270)
            annualSeason += 0.15f;

        // Day-of-week pattern (weekdays higher, Sunday lowest)
        var dowMultiplier = date.DayOfWeek switch
        {
            DayOfWeek.Monday => 1.05f,
            DayOfWeek.Tuesday => 1.10f,
            DayOfWeek.Wednesday => 1.08f,
            DayOfWeek.Thursday => 1.05f,
            DayOfWeek.Friday => 1.15f,
            DayOfWeek.Saturday => 0.90f,
            DayOfWeek.Sunday => 0.75f,
            _ => 1.0f
        };

        // Gaussian noise
        var u1 = 1.0 - Rng.NextDouble();
        var u2 = Rng.NextDouble();
        var noise = (float)(Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2));

        var demand = trend * annualSeason * dowMultiplier + noise * volatility * baseDemand;

        return MathF.Max(0, MathF.Round(demand));
    }
}
