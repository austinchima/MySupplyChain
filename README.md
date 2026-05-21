# MySupplyChain

[![CI](https://github.com/austinchima/MySupplyChain/actions/workflows/ci.yml/badge.svg)](https://github.com/austinchima/MySupplyChain/actions/workflows/ci.yml)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade supply chain management API built with **ASP.NET Core 10**, **Clean Architecture**, **CQRS + MediatR**, and **ML.NET SSA time series forecasting**.

## Architecture

```
MySupplyChain/
├── MySupplyChain.Domain          # Entities, enums, value objects (zero dependencies)
├── MySupplyChain.Application     # CQRS handlers, interfaces, DTOs (depends on Domain)
├── MySupplyChain.Infrastructure  # EF Core, ML.NET, JWT auth (implements Application interfaces)
├── MySupplyChain.API             # Controllers, middleware, Swagger (composition root)
├── MySupplyChain.ModelTrainer    # Offline SSA model training console app
└── MySupplyChain.Tests           # Unit + integration tests (23 passing)
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Clean Architecture** | Enforces dependency inversion — Domain has zero dependencies, Infrastructure implements Application interfaces |
| **CQRS + MediatR** | Separates read/write paths, enables pipeline behaviors (validation, logging) |
| **SSA Forecasting** | Singular Spectrum Analysis captures seasonality + trend without feature engineering |
| **JWT Auth** | Stateless authentication suitable for containerized horizontal scaling |

## ML.NET Demand Forecasting

The forecasting engine uses **Singular Spectrum Analysis (SSA)** via `Microsoft.ML.TimeSeries` to decompose historical sales into trend, seasonality, and noise components.

**API Response:**
```json
{
  "productId": 1,
  "forecastedUnits": [12.3, 14.1, 13.8, ...],
  "lowerBound": [8.1, 9.5, 9.2, ...],
  "upperBound": [16.5, 18.7, 18.4, ...],
  "totalPredictedDemand": 402.5,
  "rmse": 3.21,
  "mae": 2.84,
  "horizon": 30,
  "shouldReorder": true,
  "recommendation": "⚠️ REORDER RECOMMENDED: ..."
}
```

**Features:**
- Multi-day horizon forecasts (default: 30 days, configurable via query parameter)
- 95% confidence intervals (lower/upper bounds)
- Model accuracy metrics (RMSE, MAE)
- Automatic fallback to moving average when model is unavailable
- Per-product SSA models for maximum accuracy

## Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for containerized setup)

### Option 1: Docker Compose (recommended)

```bash
docker compose up --build
```

The API will be available at `http://localhost:5000/swagger`.

### Option 2: Local Development

```bash
# 1. Set up user secrets for JWT
cd MySupplyChain.API
dotnet user-secrets init
dotnet user-secrets set "JwtSettings:Secret" "YourDevSecretKey_MustBeAtLeast32Characters!"

# 2. Update connection string in appsettings.json to point to your SQL Server

# 3. Run migrations
dotnet ef database update --project MySupplyChain.Infrastructure --startup-project MySupplyChain.API

# 4. Train the ML model on the Kaggle dataset (place train.csv in data/)
    dotnet run --project MySupplyChain.ModelTrainer -c Release

# 5. Run the API
dotnet run --project MySupplyChain.API
```

### Training Data

The model trainer uses the [Kaggle Store Item Demand Forecasting](https://www.kaggle.com/c/demand-forecasting-kernels-only) dataset.

Place the files in the `data/` directory at the solution root:

| File | Description | Used by trainer? |
|---|---|---|
| `data/train.csv` | 913,000 rows of daily sales across 10 stores × 50 items, 2013–2017 | ✅ Yes — default input |

**Expected schema for `train.csv`:**
```
date,store,item,sales
2013-01-01,1,1,13
```

The trainer groups rows by `item`, trains a separate SSA model per product, and saves each to `MySupplyChain.Infrastructure/MLModels/`.

To train with a custom CSV (must match the same 4-column schema):
```bash
dotnet run --project MySupplyChain.ModelTrainer -c Release -- --data=path/to/your/data.csv
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products/{id}/forecast?daysToForecast=30` | Get AI demand forecast |
| `POST` | `/api/products/{id}/restock` | Restock a product |
| `POST` | `/api/orders` | Place an order (auto-triggers reorder if stock is low) |

All endpoints except auth require a valid JWT Bearer token.

## Testing

```bash
# Run all 23 tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

**Test Coverage:**
- **Unit tests** — DemandForecaster (5 tests), Domain validation
- **Integration tests** — Full API lifecycle via `WebApplicationFactory` with in-memory EF Core
- **Auth tests** — Registration, login, token validation, duplicate user handling

## Performance & Micro-Benchmarks

To validate real-world readiness, the solution includes a dedicated **BenchmarkDotNet** micro-benchmark suite (`MySupplyChain.Benchmarks`) evaluating CSV parsing throughput, forecasting overhead, and CQRS handler latency.

The following benchmarks were executed on:
- **OS**: Windows 11 (10.0.26200.8457)
- **CPU**: 11th Gen Intel Core i5-1135G7 2.40GHz, 1 CPU, 8 logical and 4 physical cores
- **Runtime**: .NET 10.0.8 (10.0.826.23019), X64 RyuJIT AVX-512F+CD+BW+DQ+VL+VBMI

### 1. ML.NET SSA Forecasting Latency
Measures the latency of the Singular Spectrum Analysis (SSA) forecasting pipeline versus the fallback moving-average calculator.

| Method | Mean | Max | P95 | Allocated | GC Gen 0 |
|---|---:|---:|---:|---:|---:|
| **SSA Forecast** (30-day history, 7-day horizon) | **1.134 ms** | 1.679 ms | 1.639 ms | 686.92 KB | 15.6250 |
| **SSA Forecast** (90-day history, 30-day horizon) | **967.22 μs** | 1.194 ms | 1.192 ms | 380.92 KB | 15.6250 |
| **SSA Forecast** (365-day history, 30-day horizon) | **857.63 μs** | 1.144 ms | 1.119 ms | 381.99 KB | 15.6250 |
| **Fallback Moving-Average** (no model) | **1.15 μs** | 1.64 μs | 1.61 μs | 1.50 KB | 0.3662 |

> [!TIP]
> Even with a full year of sales history (365 days) and a 30-day prediction horizon, the ML.NET SSA forecaster runs in **under 1 millisecond** (857.63 μs) with zero external network overhead, confirming it is highly suitable for real-time order-processing pipelines.

### 2. CQRS Commands & Queries
Measures the end-to-end execution of MediatR command and query handlers using an in-memory database context.

| Method | Mean | Max | P95 | Allocated | GC Gen 0 / Gen 1 |
|---|---:|---:|---:|---:|---:|
| **CreateProductCommandHandler** | **1.366 ms** | 2.580 ms | 2.470 ms | 1.36 MB | 335.9375 / 0 |
| **CreateOrderCommandHandler** (No reorder) | **4.612 ms** | 6.458 ms | 6.185 ms | 4.52 MB | 1123.0469 / 76.1719 |
| **GetAllProductsQuery** (50 products) | **21.44 μs** | 31.13 μs | 28.68 μs | 36.36 KB | 8.8806 / 0 |
| **GetProductForecastQuery** (365-day history) | **311.14 μs** | 385.62 μs | 369.75 μs | 196.62 KB | 44.9219 / 3.9063 |

> [!NOTE]
> Command handlers include database seeding and complete lifecycle execution, achieving single-digit millisecond latency. Queries run in microseconds due to optimized LINQ projections.

### 3. CSV Dataset Parsing
Measures string splitting and token parsing performance on the Kaggle demand forecasting dataset using standard .NET file streaming.

| Method | Size | Mean | Max | P95 | Allocated |
|---|---|---:|---:|---:|---:|
| **Parse test.csv** (~45K rows) | 0.9 MB | **6.514 ms** | 9.078 ms | 8.602 ms | 10.99 MB |
| **Parse train.csv** (913K rows) | 17.3 MB | **297.895 ms** | 320.369 ms | 315.194 ms | 221.17 MB |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | .NET 10 / ASP.NET Core 10 |
| ORM | Entity Framework Core 10 |
| Database | SQL Server 2022 |
| Auth | JWT Bearer + ASP.NET Core Identity |
| ML | ML.NET 5.0 (SSA Time Series) |
| CQRS | MediatR 14 |
| Logging | Serilog (structured, rolling file + console) |
| Testing | xUnit + Moq + FluentAssertions |
| Benchmarking | BenchmarkDotNet (latency + memory allocation) |
| CI | GitHub Actions |
| Containerization | Docker + Docker Compose |

## License

[MIT](LICENSE)
