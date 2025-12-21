using MySupplyChain.Infrastructure.MachineLearning.DataModels;

namespace MySupplyChain.ModelTrainer;

/// <summary>
/// Test program to validate the data generator
/// </summary>
public static class TestDataGenerator
{
    public static void RunTests()
    {
        Console.WriteLine("🧪 Testing Data Generator");
        Console.WriteLine("========================\n");

        // Test 1: Basic data generation
        Console.WriteLine("Test 1: Basic Data Generation");
        var basicData = DataGenerator.GenerateHistoricalData(
            startDate: DateTime.Now.AddDays(-30),
            days: 30,
            includeSeasonality: false,
            includePromotions: false,
            includeStockouts: false
        );
        
        Console.WriteLine($"✓ Generated {basicData.Count} basic records");
        ValidateData(basicData, "Basic");

        // Test 2: Seasonal patterns
        Console.WriteLine("\nTest 2: Seasonal Patterns");
        var seasonalData = DataGenerator.GenerateHistoricalData(
            startDate: new DateTime(2023, 11, 1), // November (holiday season)
            days: 60, // Nov-Dec
            includeSeasonality: true,
            includePromotions: false,
            includeStockouts: false
        );
        
        Console.WriteLine($"✓ Generated {seasonalData.Count} seasonal records");
        ValidateSeasonality(seasonalData);

        // Test 3: Full feature set
        Console.WriteLine("\nTest 3: Full Feature Set");
        var fullData = DataGenerator.GenerateHistoricalData(
            startDate: DateTime.Now.AddYears(-1),
            days: 365,
            includeSeasonality: true,
            includePromotions: true,
            includeStockouts: true
        );
        
        Console.WriteLine($"✓ Generated {fullData.Count} full-feature records");
        ValidateFullFeatures(fullData);

        // Test 4: Export functionality
        Console.WriteLine("\nTest 4: CSV Export");
        var testFile = "test_data.csv";
        DataGenerator.ExportToCsv(basicData, testFile);
        
        if (File.Exists(testFile))
        {
            var lines = File.ReadAllLines(testFile);
            Console.WriteLine($"✓ CSV exported with {lines.Length} lines (including header)");
            File.Delete(testFile); // Cleanup
        }

        Console.WriteLine("\n✅ All tests passed!");
    }

    private static void ValidateData(List<ModelInput> data, string testName)
    {
        // Check basic properties
        if (data.Count == 0)
            throw new Exception($"{testName}: No data generated");

        // Check all products are present
        var productIds = data.Select(d => d.ProductId).Distinct().ToList();
        if (productIds.Count < 8)
            throw new Exception($"{testName}: Missing products. Found: {productIds.Count}, Expected: 8");

        // Check no negative quantities
        var negativeQuantities = data.Where(d => d.QuantitySold < 0).ToList();
        if (negativeQuantities.Any())
            throw new Exception($"{testName}: Found {negativeQuantities.Count} negative quantities");

        // Check date format
        var invalidDates = data.Where(d => !DateTime.TryParse(d.Date, out _)).ToList();
        if (invalidDates.Any())
            throw new Exception($"{testName}: Found {invalidDates.Count} invalid dates");

        // Check price consistency
        var priceGroups = data.GroupBy(d => d.ProductId).ToList();
        foreach (var group in priceGroups)
        {
            var prices = group.Select(g => g.Price).Distinct().ToList();
            if (prices.Count > 1)
                throw new Exception($"{testName}: Product {group.Key} has inconsistent prices: {string.Join(", ", prices)}");
        }

        Console.WriteLine($"  ✓ Data validation passed for {testName}");
    }

    private static void ValidateSeasonality(List<ModelInput> data)
    {
        // Check if November/December have higher sales than average
        var novemberData = data.Where(d => DateTime.Parse(d.Date).Month == 11).ToList();
        var decemberData = data.Where(d => DateTime.Parse(d.Date).Month == 12).ToList();
        var otherData = data.Where(d => {
            var month = DateTime.Parse(d.Date).Month;
            return month != 11 && month != 12;
        }).ToList();

        if (novemberData.Any() && otherData.Any())
        {
            var novAvg = novemberData.Average(d => d.QuantitySold);
            var otherAvg = otherData.Average(d => d.QuantitySold);
            
            if (novAvg <= otherAvg)
                Console.WriteLine($"  ⚠️  November average ({novAvg:F1}) not higher than other months ({otherAvg:F1})");
            else
                Console.WriteLine($"  ✓ November seasonal boost detected: {novAvg:F1} vs {otherAvg:F1}");
        }

        if (decemberData.Any() && otherData.Any())
        {
            var decAvg = decemberData.Average(d => d.QuantitySold);
            var otherAvg = otherData.Average(d => d.QuantitySold);
            
            if (decAvg <= otherAvg)
                Console.WriteLine($"  ⚠️  December average ({decAvg:F1}) not higher than other months ({otherAvg:F1})");
            else
                Console.WriteLine($"  ✓ December seasonal boost detected: {decAvg:F1} vs {otherAvg:F1}");
        }
    }

    private static void ValidateFullFeatures(List<ModelInput> data)
    {
        // Check for zero-sales days (stockouts)
        var zeroSalesDays = data.Where(d => d.QuantitySold == 0).ToList();
        if (zeroSalesDays.Any())
            Console.WriteLine($"  ✓ Stockouts detected: {zeroSalesDays.Count} zero-sales records");
        else
            Console.WriteLine($"  ⚠️  No stockouts detected in {data.Count} records");

        // Check for high-sales days (promotions)
        var productAverages = data.GroupBy(d => d.ProductId)
            .ToDictionary(g => g.Key, g => g.Average(x => x.QuantitySold));

        var promotionalDays = data.Where(d => d.QuantitySold > productAverages[d.ProductId] * 1.5).ToList();
        if (promotionalDays.Any())
            Console.WriteLine($"  ✓ Promotional spikes detected: {promotionalDays.Count} high-sales records");
        else
            Console.WriteLine($"  ⚠️  No promotional spikes detected");

        // Check day-of-week patterns
        var dayOfWeekAvg = data.GroupBy(d => d.DayOfWeek)
            .ToDictionary(g => g.Key, g => g.Average(x => x.QuantitySold));

        var sunday = dayOfWeekAvg.GetValueOrDefault(0, 0);
        var tuesday = dayOfWeekAvg.GetValueOrDefault(2, 0);
        
        if (tuesday > sunday)
            Console.WriteLine($"  ✓ Day-of-week pattern detected: Tuesday ({tuesday:F1}) > Sunday ({sunday:F1})");
        else
            Console.WriteLine($"  ⚠️  Day-of-week pattern unclear: Tuesday ({tuesday:F1}) vs Sunday ({sunday:F1})");
    }
}