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
- [Entity Framework Core Tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (`dotnet tool install --global dotnet-ef`)
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
