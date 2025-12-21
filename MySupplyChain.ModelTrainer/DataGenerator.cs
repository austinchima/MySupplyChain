using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.ModelTrainer;

/// <summary>
/// Generates realistic historical sales data for training the demand forecasting model
/// </summary>
public static class DataGenerator
{
    private static readonly Random Random = new(42); // Fixed seed for reproducibility

    /// <summary>
    /// Product definitions with realistic characteristics including SKUs
    /// </summary>
    private static readonly Dictionary<int, ProductInfo> Products = new()
    {
        { 1, new ProductInfo("Dell Laptop XPS 13", "DELL-XPS-001", 1299.99f, 8f, 0.3f, 1.2f) },
        { 2, new ProductInfo("HP LaserJet Printer", "HP-LJ-P404", 299.99f, 12f, 0.2f, 0.8f) },
        { 3, new ProductInfo("Logitech Wireless Mouse", "LOGI-MX-M705", 29.99f, 45f, 0.4f, 1.5f) },
        { 4, new ProductInfo("Samsung 27\" Monitor", "SAMS-M7-27", 249.99f, 15f, 0.25f, 1.1f) },
        { 5, new ProductInfo("Apple Magic Keyboard", "APPL-MK-A1644", 99.99f, 25f, 0.35f, 1.3f) },
        { 6, new ProductInfo("Sony Noise-Canceling Headphones", "SONY-WH-1000XM4", 199.99f, 20f, 0.3f, 1.4f) },
        { 7, new ProductInfo("Webcam HD 1080p", "LOGI-C920-HD", 79.99f, 35f, 0.5f, 1.6f) },
        { 8, new ProductInfo("External Hard Drive 1TB", "WD-ELE-1TB", 89.99f, 18f, 0.2f, 0.9f) }
    };

    /// <summary>
    /// Generates realistic historical sales data
    /// </summary>
    public static List<ModelInput> GenerateHistoricalData(
        DateTime startDate,
        int days = 365,
        bool includeSeasonality = true,
        bool includePromotions = true,
        bool includeStockouts = true)
    {
        var data = new List<ModelInput>();
        var promotions = GeneratePromotions(startDate, days);
        var stockouts = GenerateStockouts(startDate, days);

        Console.WriteLine($"📊 Generating {days} days of sales data for {Products.Count} products...");
        Console.WriteLine(
            $"🎯 Features: Seasonality={includeSeasonality}, Promotions={includePromotions}, Stockouts={includeStockouts}");

        for (int day = 0; day < days; day++)
        {
            var currentDate = startDate.AddDays(day);
            var seasonalMultiplier = includeSeasonality ? GetSeasonalMultiplier(currentDate) : 1.0f;
            var dayOfWeekMultiplier = GetDayOfWeekMultiplier(currentDate.DayOfWeek);

            foreach (var (productId, product) in Products)
            {
                // Check if product is in stockout
                if (includeStockouts && IsInStockout(productId, currentDate, stockouts))
                {
                    data.Add(CreateRecord(productId, product.Sku, currentDate, 0f, product.Price));
                    continue;
                }

                // Base demand with trend
                var trendMultiplier = 1.0f + (day / (float)days) * product.TrendFactor * 0.1f;
                var baseDemand = product.BaseDemand * trendMultiplier;

                // Apply multipliers
                var demand = baseDemand * seasonalMultiplier * dayOfWeekMultiplier;

                // Promotional effects
                if (includePromotions && IsInPromotion(productId, currentDate, promotions))
                {
                    var promoBoost = 1.5f + (Random.NextSingle() * 0.5f);
                    demand *= promoBoost;
                }

                // Add noise and ensure non-negative
                var noise = (Random.NextSingle() - 0.5f) * 2 * product.Volatility * baseDemand;
                demand = Math.Max(0, demand + noise);
                demand = (float)Math.Round(demand, 1);

                data.Add(CreateRecord(productId, product.Sku, currentDate, demand, product.Price));
            }

            if (day % 30 == 0)
            {
                Console.WriteLine($"✓ Generated data for day {day + 1}/{days} ({currentDate:yyyy-MM-dd})");
            }
        }

        Console.WriteLine($"✅ Generated {data.Count} sales records");
        PrintDataSummary(data);
        return data;
    }

    private static ModelInput CreateRecord(int productId, string sku, DateTime date, float quantity, float price)
    {
        return new ModelInput
        {
            ProductId = productId,
            Sku = sku,
            Date = date.ToString("yyyy-MM-dd"),
            QuantitySold = quantity,
            Price = price,
            DayOfWeek = (float)date.DayOfWeek,
            Month = date.Month
        };
    }

    private static float GetSeasonalMultiplier(DateTime date)
    {
        var dayOfYear = date.DayOfYear;

        if (IsInRange(dayOfYear, 320, 365) || IsInRange(dayOfYear, 1, 15))
            return 1.8f + (Random.NextSingle() * 0.4f);

        if (IsInRange(dayOfYear, 320, 330))
            return 2.2f + (Random.NextSingle() * 0.5f);

        if (IsInRange(dayOfYear, 240, 270))
            return 1.4f + (Random.NextSingle() * 0.3f);

        if (IsInRange(dayOfYear, 180, 240))
            return 0.8f + (Random.NextSingle() * 0.2f);

        if (IsInRange(dayOfYear, 60, 120))
            return 1.2f + (Random.NextSingle() * 0.2f);

        return 1.0f + (Random.NextSingle() * 0.2f - 0.1f);
    }

    private static float GetDayOfWeekMultiplier(DayOfWeek dayOfWeek)
    {
        return dayOfWeek switch
        {
            DayOfWeek.Monday => 1.1f,
            DayOfWeek.Tuesday => 1.2f,
            DayOfWeek.Wednesday => 1.15f,
            DayOfWeek.Thursday => 1.1f,
            DayOfWeek.Friday => 1.3f,
            DayOfWeek.Saturday => 0.9f,
            DayOfWeek.Sunday => 0.7f,
            _ => 1.0f
        };
    }

    private static List<Promotion> GeneratePromotions(DateTime startDate, int days)
    {
        var promotions = new List<Promotion>();
        var currentDate = startDate;

        while (currentDate < startDate.AddDays(days))
        {
            var nextPromoIn = Random.Next(14, 42);
            currentDate = currentDate.AddDays(nextPromoIn);

            if (currentDate >= startDate.AddDays(days)) break;

            var productId = Products.Keys.ElementAt(Random.Next(Products.Count));
            var duration = Random.Next(3, 8);

            promotions.Add(new Promotion(productId, currentDate, currentDate.AddDays(duration)));
        }

        return promotions;
    }

    private static List<Stockout> GenerateStockouts(DateTime startDate, int days)
    {
        var stockouts = new List<Stockout>();
        var currentDate = startDate;

        while (currentDate < startDate.AddDays(days))
        {
            var nextStockoutIn = Random.Next(30, 90);
            currentDate = currentDate.AddDays(nextStockoutIn);

            if (currentDate >= startDate.AddDays(days)) break;

            var productId = Products.Keys.ElementAt(Random.Next(Products.Count));
            var duration = Random.Next(1, 4);

            stockouts.Add(new Stockout(productId, currentDate, currentDate.AddDays(duration)));
        }

        return stockouts;
    }

    private static bool IsInPromotion(int productId, DateTime date, List<Promotion> promotions)
    {
        return promotions.Any(p => p.ProductId == productId && date >= p.StartDate && date <= p.EndDate);
    }

    private static bool IsInStockout(int productId, DateTime date, List<Stockout> stockouts)
    {
        return stockouts.Any(s => s.ProductId == productId && date >= s.StartDate && date <= s.EndDate);
    }

    private static bool IsInRange(int value, int start, int end)
    {
        return value >= start && value <= end;
    }

    private static void PrintDataSummary(List<ModelInput> data)
    {
        Console.WriteLine("\n📈 Data Summary:");
        Console.WriteLine("================");

        foreach (var productGroup in data.GroupBy(d => d.ProductId))
        {
            var productId = (int)productGroup.Key;
            var product = Products[productId];
            var quantities = productGroup.Select(g => g.QuantitySold).ToList();

            Console.WriteLine($"Product {productId} ({product.Sku} - {product.Name}):");
            Console.WriteLine($"  • Total Sales: {quantities.Sum():F1} units");
            Console.WriteLine($"  • Avg Daily: {quantities.Average():F1} units");
            Console.WriteLine($"  • Max Daily: {quantities.Max():F1} units");
            Console.WriteLine($"  • Zero-sales days: {quantities.Count(q => q == 0)}");
        }

        var totalSales = data.Sum(d => d.QuantitySold);
        var dailySales = data.GroupBy(d => d.Date).Select(g => g.Sum(x => x.QuantitySold));
        var avgDailySales = dailySales.Average();

        Console.WriteLine("\nOverall:");
        Console.WriteLine($"  • Total Sales: {totalSales:F1} units");
        Console.WriteLine($"  • Avg Daily Sales: {avgDailySales:F1} units");
        Console.WriteLine($"  • Date Range: {data.Min(d => d.Date)} to {data.Max(d => d.Date)}");
    }

    public static void ExportToCsv(List<ModelInput> data, string filePath)
    {
        Console.WriteLine($"\n💾 Exporting data to: {filePath}");

        using var writer = new StreamWriter(filePath);
        writer.WriteLine("ProductId,Sku,Date,QuantitySold,Price,DayOfWeek,Month");

        foreach (var record in data.OrderBy(d => d.Date).ThenBy(d => d.ProductId))
        {
            writer.WriteLine(
                $"{record.ProductId},{record.Sku},{record.Date},{record.QuantitySold},{record.Price},{record.DayOfWeek},{record.Month}");
        }

        Console.WriteLine($"✅ Exported {data.Count} records to CSV");
    }
}

public record ProductInfo(
    string Name,
    string Sku,
    float Price,
    float BaseDemand,
    float Volatility,
    float TrendFactor
);

public record Promotion(int ProductId, DateTime StartDate, DateTime EndDate);

public record Stockout(int ProductId, DateTime StartDate, DateTime EndDate);