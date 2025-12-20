# MySupplyChain.Infrastructure 🔧

> External concerns layer implementing database persistence and ML.NET forecasting.

## Purpose

The Infrastructure layer handles all **external dependencies** like databases, file systems, and machine learning models. It implements the interfaces defined in the Application layer, keeping business logic decoupled from technical implementation details.

## Structure

```mermaid
graph TD
    A[MySupplyChain.Infrastructure]

    A --> B[Persistence]
    B --> B1[ApplicationDbContext.cs<br/>EF Core DbContext]
    B --> B2[ApplicationDbContextSeed.cs<br/>Initial data seeding]
    B --> B3[Configurations/]
    B3 --> B3a[ProductConfiguration.cs<br/>Product table config]
    B3 --> B3b[SalesHistoryConfiguration.cs<br/>Sales table config]
    B3 --> B3c[ReorderRequestConfiguration.cs<br/>ReorderRequest table config]

    A --> C[MachineLearning]
    C --> C1[DemandForecaster.cs<br/>ML.NET implementation]
    C --> C2[DataModels/]
    C2 --> C2a[ModelInput.cs<br/>Training data format]
    C2 --> C2b[ModelOutput.cs<br/>Prediction result]
    C --> C3[MLModels/]
    C3 --> C3a[sales_model.zip<br/>Trained ML model]

    A --> D[DependencyInjection.cs<br/>Service registration]
    A --> E[GlobalUsings.cs<br/>Common namespaces]
```

## Key Components

### 1. Database (EF Core)

#### ApplicationDbContext

Implements `IApplicationDbContext` interface from Application layer.

```csharp
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<SalesHistory> SalesHistories => Set<SalesHistory>();
    public DbSet<ReorderRequest> ReorderRequests => Set<ReorderRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            Assembly.GetExecutingAssembly());
    }
}
```

#### Fluent API Configurations

Instead of Data Annotations, we use Fluent API in separate configuration files:

**ProductConfiguration.cs:**

```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Sku)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.Sku)
            .IsUnique();

        builder.HasMany(p => p.SalesHistory)
            .WithOne(s => s.Product)
            .HasForeignKey(s => s.ProductId);
    }
}
```

**Why Fluent API?**

- Keeps Domain entities clean (no database attributes)
- Centralizes all database configuration
- More powerful than Data Annotations

#### Data Seeding

`ApplicationDbContextSeed.cs` provides initial data:

```csharp
public static class ApplicationDbContextSeed
{
    public static void SeedData(ApplicationDbContext context)
    {
        if (!context.Products.Any())
        {
            context.Products.AddRange(
                new Product
                {
                    Name = "Dell Laptop",
                    Sku = "DELL-L-001",
                    CurrentStock = 50,
                    ReorderPoint = 10,
                    Price = 1200.00m
                },
                // ... more products
            );

            context.SaveChanges();
        }

        // Seed historical sales for ML training
        if (!context.SalesHistories.Any())
        {
            // Generate 30 days of sales data
            // ...
        }
    }
}
```

### 2. Machine Learning (ML.NET)

#### DemandForecaster

Implements `IDemandForecaster` interface.

```csharp
public class DemandForecaster : IDemandForecaster
{
    private readonly MLContext _mlContext;
    private readonly ITransformer? _model;
    private readonly ILogger<DemandForecaster> _logger;

    public DemandForecaster(string modelPath, ILogger<DemandForecaster> logger)
    {
        _mlContext = new MLContext(seed: 0);
        _logger = logger;

        if (File.Exists(modelPath))
        {
            _model = _mlContext.Model.Load(modelPath, out _);
            _logger.LogInformation("ML model loaded: {ModelFile}",
                Path.GetFileName(modelPath));
        }
        else
        {
            _logger.LogWarning("No ML model found at: {ModelPath}", modelPath);
        }
    }

    public Task<float> PredictDemandAsync(
        int productId,
        IEnumerable<float> historicalSales)
    {
        var salesList = historicalSales.ToList();

        // Fallback: use simple average if model not trained yet
        if (_model == null)
        {
            var avg = salesList.Count != 0 ? salesList.Average() : 0f;
            _logger.LogWarning("Model not loaded. Returning average: {Avg}", avg);
            return Task.FromResult(avg);
        }

        try
        {
            var predictionEngine = _mlContext.Model
                .CreatePredictionEngine<ModelInput, ModelOutput>(_model);

            var avgSales = salesList.Take(30).Average();
            var input = new ModelInput
            {
                ProductId = productId,
                QuantitySold = avgSales,
                DayOfWeek = (int)DateTime.Now.DayOfWeek,
                Month = DateTime.Now.Month
            };

            var prediction = predictionEngine.Predict(input);
            return Task.FromResult(prediction.PredictedDemand);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Prediction failed for product {ProductId}", productId);
            // Fallback to average
            return Task.FromResult(salesList.Average());
        }
    }
}
```

**Key Features:**

- ✅ Graceful fallback when model not available
- ✅ Logging for observability
- ✅ Error handling with fallback logic

#### ML Data Models

**ModelInput.cs** (What goes INTO the model):

```csharp
public class ModelInput
{
    [LoadColumn(0)]
    public string Date { get; set; }

    [LoadColumn(1)]
    public int ProductId { get; set; }

    [LoadColumn(2)]
    public float QuantitySold { get; set; }

    [LoadColumn(3)]
    public int DayOfWeek { get; set; }

    [LoadColumn(4)]
    public int Month { get; set; }

    [LoadColumn(5)]
    public float Price { get; set; }
}
```

**ModelOutput.cs** (What comes OUT of the model):

```csharp
public class ModelOutput
{
    [ColumnName("Score")]
    public float PredictedDemand { get; set; }
}
```

## Dependency Injection

Register Infrastructure services in the API:

```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register EF Core with SQL Server
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        // Register DbContext interface
        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Register ML.NET Demand Forecaster
        var modelPath = Path.Combine(
            AppDomain.CurrentDomain.BaseDirectory,
            "MLModels",
            "sales_model.zip");

        services.AddSingleton<IDemandForecaster>(provider =>
        {
            var logger = provider.GetRequiredService<ILogger<DemandForecaster>>();
            return new DemandForecaster(modelPath, logger);
        });

        return services;
    }
}
```

## Database Migrations

**Creating Migrations:**

```bash
# From Infrastructure directory
dotnet ef migrations add InitialCreate -s ../MySupplyChain.API

# Apply migrations
dotnet ef database update -s ../MySupplyChain.API
```

**Note:** `-s` flag specifies the startup project (API).

## Configuration

**appsettings.json in API project:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MySupplyChainDb;Trusted_Connection=true;"
  }
}
```

## Dependencies

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.0.*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.*" />
<PackageReference Include="Microsoft.ML" Version="3.0.*" />

<ProjectReference Include="..\MySupplyChain.Domain\..." />
<ProjectReference Include="..\MySupplyChain.Application\..." />
```

## Testing

For testing, Infrastructure can be swapped:

- Use **InMemory database** instead of SQL Server
- Use **mock forecaster** instead of real ML model

See [MySupplyChain.Tests](../MySupplyChain.Tests/README.md) for examples.

## Best Practices

✅ **Do:**

- Use Fluent API for all EF configurations
- Implement proper error handling in external services
- Provide fallback logic for ML predictions
- Use dependency injection for flexibility

❌ **Don't:**

- Put business logic in Infrastructure
- Use Data Annotations on Domain entities
- Hardcode file paths or connection strings

---

**Related Documentation:**

- [Application Layer](../MySupplyChain.Application/README.md) - Defines interfaces we implement
- [ModelTrainer](../MySupplyChain.ModelTrainer/README.md) - Generates the ML model
- [Root README](../README.md) - Getting started with database setup
