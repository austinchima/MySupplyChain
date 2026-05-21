using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Columns;
using BenchmarkDotNet.Configs;
using BenchmarkDotNet.Diagnosers;
using BenchmarkDotNet.Exporters;
using BenchmarkDotNet.Exporters.Csv;
using BenchmarkDotNet.Jobs;
using BenchmarkDotNet.Running;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Orders.Commands.CreateOrder;
using MySupplyChain.Application.Products.Commands.CreateProduct;
using MySupplyChain.Application.Products.Queries.GetAllProducts;
using MySupplyChain.Application.Products.Queries.GetProductForecast;
using MySupplyChain.Domain.Entities;
using MySupplyChain.Infrastructure.MachineLearning;
using MySupplyChain.Infrastructure.Persistence;

// ─── Entry Point ──────────────────────────────────────────────────────────────
var config = ManualConfig.Create(DefaultConfig.Instance)
    .AddJob(Job.Default
        .WithWarmupCount(3)
        .WithIterationCount(10))
    .AddDiagnoser(MemoryDiagnoser.Default)
    .AddColumn(StatisticColumn.P95)
    .AddColumn(StatisticColumn.Max)
    .AddExporter(CsvExporter.Default)
    .AddExporter(HtmlExporter.Default)
    .WithOptions(ConfigOptions.DisableOptimizationsValidator);

Console.WriteLine("MySupplyChain — BenchmarkDotNet Performance Suite");
Console.WriteLine("=================================================");
Console.WriteLine("Running in Release mode. Results saved to BenchmarkDotNet.Artifacts/\n");

BenchmarkRunner.Run(
[
    typeof(ForecastingBenchmarks),
    typeof(CommandHandlerBenchmarks),
    typeof(QueryHandlerBenchmarks),
    typeof(CsvParsingBenchmarks),
], config);

// ─── Benchmark 1: SSA Forecasting ────────────────────────────────────────────
[MemoryDiagnoser]
[SimpleJob(warmupCount: 3, iterationCount: 10)]
public class ForecastingBenchmarks
{
    private DemandForecaster _forecaster = null!;
    private float[] _shortHistory  = null!;   // 30 days
    private float[] _mediumHistory = null!;   // 90 days
    private float[] _longHistory   = null!;   // 365 days

    [GlobalSetup]
    public void Setup()
    {
        var modelPath = FindModelPath();
        _forecaster = new DemandForecaster(modelPath, NullLogger<DemandForecaster>.Instance);

        var rng = new Random(42);
        _shortHistory  = GenerateSeries(rng, 30);
        _mediumHistory = GenerateSeries(rng, 90);
        _longHistory   = GenerateSeries(rng, 365);
    }

    [Benchmark(Description = "SSA forecast — 30 days history, 7-day horizon")]
    public async Task<ForecastResult> Forecast_Short_7Day()
        => await _forecaster.PredictDemandAsync(1, "BENCH-SKU", _shortHistory, horizon: 7);

    [Benchmark(Description = "SSA forecast — 90 days history, 30-day horizon")]
    public async Task<ForecastResult> Forecast_Medium_30Day()
        => await _forecaster.PredictDemandAsync(1, "BENCH-SKU", _mediumHistory, horizon: 30);

    [Benchmark(Description = "SSA forecast — 365 days history, 30-day horizon")]
    public async Task<ForecastResult> Forecast_Long_30Day()
        => await _forecaster.PredictDemandAsync(1, "BENCH-SKU", _longHistory, horizon: 30);

    [Benchmark(Description = "Fallback moving-average (no model)")]
    public async Task<ForecastResult> Forecast_Fallback()
    {
        // Force fallback by passing fewer than 14 points
        var tinyHistory = GenerateSeries(new Random(1), 5);
        return await _forecaster.PredictDemandAsync(1, "BENCH-SKU", tinyHistory, horizon: 30);
    }

    private static float[] GenerateSeries(Random rng, int count)
    {
        var series = new float[count];
        float base_ = 50f;
        for (int i = 0; i < count; i++)
        {
            // Trend + weekly seasonality + noise
            base_ += rng.NextSingle() * 0.2f - 0.1f;
            var seasonal = 5f * MathF.Sin(2f * MathF.PI * i / 7f);
            var noise = (float)(rng.NextDouble() * 4 - 2);
            series[i] = MathF.Max(0, base_ + seasonal + noise);
        }
        return series;
    }

    private static string FindModelPath()
    {
        var dir = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        while (dir != null && !dir.GetFiles("*.slnx").Any() && !dir.GetFiles("*.sln").Any())
            dir = dir.Parent;
        return Path.Combine(dir?.FullName ?? ".", "MySupplyChain.Infrastructure", "MLModels", "sales_model.zip");
    }
}

// ─── Benchmark 2: CQRS Command Handlers ──────────────────────────────────────
[MemoryDiagnoser]
[SimpleJob(warmupCount: 3, iterationCount: 10)]
public class CommandHandlerBenchmarks
{
    private IApplicationDbContext _db = null!;
    private Mock<IDemandForecaster> _forecasterMock = null!;
    private ServiceProvider _serviceProvider = null!;
    private int _seededProductId;

    [GlobalSetup]
    public void Setup()
    {
        var services = new ServiceCollection();
        services.AddDbContext<ApplicationDbContext>(o =>
            o.UseInMemoryDatabase("BenchmarkDb_" + Guid.NewGuid()));
        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        _serviceProvider = services.BuildServiceProvider();

        var scope = _serviceProvider.CreateScope();
        _db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        // Seed a product and some sales history
        var product = new Product
        {
            Name = "Benchmark Product",
            Sku = "BENCH-001",
            Price = 99.99m,
            CurrentStock = 10000,
            ReorderPoint = 5
        };
        _db.Products.Add(product);
        _db.SaveChangesAsync().GetAwaiter().GetResult();
        _seededProductId = product.Id;

        // Seed sales history (avoids reorder trigger during benchmark)
        for (int i = 0; i < 60; i++)
        {
            _db.SalesHistories.Add(new SalesHistory
            {
                ProductId = _seededProductId,
                Sku = "BENCH-001",
                Date = DateTime.UtcNow.AddDays(-i),
                QuantitySold = 5
            });
        }
        _db.SaveChangesAsync().GetAwaiter().GetResult();

        // Set up forecaster mock
        _forecasterMock = new Mock<IDemandForecaster>();
        _forecasterMock.Setup(f => f.PredictDemandAsync(
                It.IsAny<int>(), It.IsAny<string>(),
                It.IsAny<IEnumerable<float>>(), It.IsAny<int>()))
            .ReturnsAsync(new ForecastResult
            {
                ForecastedUnits = Enumerable.Repeat(5f, 30).ToArray(),
                LowerBound      = Enumerable.Repeat(3f, 30).ToArray(),
                UpperBound      = Enumerable.Repeat(7f, 30).ToArray(),
                Rmse = 1.5f, Mae = 1.2f
            });
        _forecasterMock.Setup(f => f.IsModelLoaded).Returns(true);
    }

    [GlobalCleanup]
    public void Cleanup() => _serviceProvider.Dispose();

    [Benchmark(Description = "CreateProductCommandHandler end-to-end")]
    public async Task<int> CreateProduct()
    {
        var handler = new CreateProductCommandHandler(_db);
        return await handler.Handle(new CreateProductCommand
        {
            Name = "Bench Item " + Guid.NewGuid(),
            Sku = "BENCH-" + Guid.NewGuid().ToString()[..8],
            Price = 49.99m,
            CurrentStock = 100,
            ReorderPoint = 10
        }, CancellationToken.None);
    }

    [Benchmark(Description = "CreateOrderCommandHandler (no reorder triggered)")]
    public async Task<int> CreateOrder()
    {
        var handler = new CreateOrderCommandHandler(_db, _forecasterMock.Object);
        return await handler.Handle(
            new CreateOrderCommand(_seededProductId, 1),
            CancellationToken.None);
    }
}

// ─── Benchmark 3: Query Handlers ─────────────────────────────────────────────
[MemoryDiagnoser]
[SimpleJob(warmupCount: 3, iterationCount: 10)]
public class QueryHandlerBenchmarks
{
    private IApplicationDbContext _db = null!;
    private Mock<IDemandForecaster> _forecasterMock = null!;
    private ServiceProvider _serviceProvider = null!;
    private int _productId;

    [GlobalSetup]
    public void Setup()
    {
        var services = new ServiceCollection();
        services.AddDbContext<ApplicationDbContext>(o =>
            o.UseInMemoryDatabase("QueryBenchmarkDb_" + Guid.NewGuid()));
        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        _serviceProvider = services.BuildServiceProvider();
        var scope = _serviceProvider.CreateScope();
        _db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        // Seed 50 products
        for (int i = 1; i <= 50; i++)
        {
            _db.Products.Add(new Product
            {
                Name = $"Product {i}",
                Sku = $"SKU-{i:D3}",
                Price = 10m * i,
                CurrentStock = 100,
                ReorderPoint = 10
            });
        }
        _db.SaveChangesAsync().GetAwaiter().GetResult();

        // Seed 365 days of sales for product 1
        _productId = 1;
        for (int d = 0; d < 365; d++)
        {
            _db.SalesHistories.Add(new SalesHistory
            {
                ProductId = _productId,
                Sku = "SKU-001",
                Date = DateTime.UtcNow.AddDays(-d),
                QuantitySold = 10 + (d % 7)
            });
        }
        _db.SaveChangesAsync().GetAwaiter().GetResult();

        _forecasterMock = new Mock<IDemandForecaster>();
        _forecasterMock.Setup(f => f.PredictDemandAsync(
                It.IsAny<int>(), It.IsAny<string>(),
                It.IsAny<IEnumerable<float>>(), It.IsAny<int>()))
            .ReturnsAsync(new ForecastResult
            {
                ForecastedUnits = Enumerable.Repeat(12f, 30).ToArray(),
                LowerBound      = Enumerable.Repeat(9f, 30).ToArray(),
                UpperBound      = Enumerable.Repeat(15f, 30).ToArray(),
                Rmse = 2.1f, Mae = 1.7f
            });
        _forecasterMock.Setup(f => f.IsModelLoaded).Returns(true);
    }

    [GlobalCleanup]
    public void Cleanup() => _serviceProvider.Dispose();

    [Benchmark(Description = "GetAllProductsQuery — 50 products")]
    public async Task<List<ProductDto>> GetAllProducts()
    {
        var handler = new GetAllProductsHandler(_db);
        return await handler.Handle(new GetAllProductsQuery(), CancellationToken.None);
    }

    [Benchmark(Description = "GetProductForecastQuery — 365-day history, 30-day horizon")]
    public async Task<ProductForecastDto> GetProductForecast()
    {
        var handler = new GetProductForecastQueryHandler(_db, _forecasterMock.Object);
        return await handler.Handle(new GetProductForecastQuery
        {
            ProductId = _productId,
            DaysToForecast = 30
        }, CancellationToken.None);
    }
}

// ─── Benchmark 4: CSV Parsing (ModelTrainer) ─────────────────────────────────
[MemoryDiagnoser]
[SimpleJob(warmupCount: 2, iterationCount: 5)]
public class CsvParsingBenchmarks
{
    private string _dataPath = null!;
    private string _samplePath = null!;

    [GlobalSetup]
    public void Setup()
    {
        // Find the real dataset
        var dir = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        while (dir != null && !dir.GetFiles("*.slnx").Any() && !dir.GetFiles("*.sln").Any())
            dir = dir.Parent;

        _dataPath   = Path.Combine(dir?.FullName ?? ".", "data", "train.csv");
        _samplePath = Path.Combine(dir?.FullName ?? ".", "data", "test.csv");
    }

    [Benchmark(Description = "Parse test.csv (~45K rows)")]
    public int ParseSmallCsv()
    {
        if (!File.Exists(_samplePath)) return 0;
        return File.ReadLines(_samplePath).Skip(1)
            .Count(line => line.Split(',').Length >= 4);
    }

    [Benchmark(Description = "Parse train.csv (913K rows, 17MB)")]
    public int ParseFullDataset()
    {
        if (!File.Exists(_dataPath)) return 0;
        int count = 0;
        foreach (var line in File.ReadLines(_dataPath).Skip(1))
        {
            var parts = line.Split(',');
            if (parts.Length >= 4 &&
                DateTime.TryParse(parts[0], out _) &&
                float.TryParse(parts[3], out _))
                count++;
        }
        return count;
    }
}
