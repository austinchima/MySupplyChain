# MySupplyChain Portfolio Showcase

[![CI](https://github.com/austinchima/MySupplyChain/actions/workflows/ci.yml/badge.svg)](https://github.com/austinchima/MySupplyChain/actions/workflows/ci.yml)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade supply chain management system engineered as a **portfolio showcase**. This project demonstrates enterprise software engineering principles using **ASP.NET Core 10**, **Clean Architecture**, **CQRS + MediatR**, **React 19**, **PostgreSQL**, **Adminer**, and **ML.NET SSA time series forecasting**.

*Note: This is an engineering case study and portfolio piece, not a commercial SaaS product.*

## Architecture

```
MySupplyChain/
├── MySupplyChain.UI              # React 19 SPA, Tailwind CSS, Glassmorphism UI
├── MySupplyChain.Domain          # Entities, enums, value objects (zero dependencies)
├── MySupplyChain.Application     # CQRS handlers, interfaces, DTOs (depends on Domain)
├── MySupplyChain.Infrastructure  # EF Core, ML.NET, JWT auth (implements Application interfaces)
├── MySupplyChain.API             # Controllers, middleware, Swagger (composition root)
├── MySupplyChain.ModelTrainer    # Offline SSA model training console app
├── MySupplyChain.Tests           # Unit + integration tests (23 passing)
└── graphify-out/                 # Standard AST knowledge graph metadata and visualization
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Clean Architecture** | Enforces dependency inversion — Domain has zero dependencies, Infrastructure implements Application interfaces |
| **CQRS + MediatR** | Separates read/write paths, enables pipeline behaviors (validation, logging) |
| **SSA Forecasting** | Singular Spectrum Analysis captures seasonality + trend without feature engineering |
| **Modern UI/UX** | React frontend with custom Tailwind CSS utilizing dynamic micro-animations and a glassmorphic aesthetic |
| **JWT Auth** | Production-grade JWT + ASP.NET Identity with password requirements and automated profile synchronization |
| **PostgreSQL Database** | Migrated from SQL Server for modern, open-source performance, native JSON support, and zero-cost cloud production container compatibility |

## Authentication System

The application utilizes a production-grade authentication flow. Demo or bypass guest access has been fully disabled to ensure top-tier security standards end-to-end. 

* **Sign Up / Sign In:** Beautiful, interactive forms featuring micro-animations, input validation, and password strength checks.
* **JWT Storage:** Tokens are securely stored, managed, and attached to all API queries.

## ML.NET Demand Forecasting

The forecasting engine uses **Singular Spectrum Analysis (SSA)** via `Microsoft.ML.TimeSeries` to decompose historical sales into trend, seasonality, and noise components.

**Features:**
- Multi-day horizon forecasts (default: 30 days, configurable via query parameter)
- 95% confidence intervals (lower/upper bounds)
- Model accuracy metrics (RMSE, MAE)
- Automatic fallback to moving average when model is unavailable
- Per-product SSA models for maximum accuracy

## Graphify Knowledge Graph

The repository includes a pre-indexed **Graphify knowledge graph** under `graphify-out/`.
* Read [GRAPH_REPORT.md](file:///e:/Personal%20Projects/MySupplyChain/graphify-out/GRAPH_REPORT.md) to inspect the structural architecture, God Nodes, and codebase community modules.
* Access the interactive interactive visualizer by opening `graphify-out/graph.html` in your web browser.
* You can update the graph schema recursively at any time:
  ```bash
  uv run graphify update . --force
  ```

## Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/en/) (for frontend)
- [Entity Framework Core Tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (`dotnet tool install --global dotnet-ef`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for containerized setup)

### Option 1: Docker Compose (recommended)

```bash
docker compose up --build
```

The stack automatically boots:
- **ASP.NET Core API** at `http://localhost:5000/swagger`
- **React Frontend UI** concurrently
- **PostgreSQL Database**
- **Adminer Database Web Client** at `http://localhost:8080` (allows you to view and run custom SQL queries on your tables out-of-the-box)

### Option 2: Local Development

```bash
# 1. Start the ASP.NET Core API
cd MySupplyChain.API
dotnet run

# 2. Run the React Frontend
cd ../MySupplyChain.UI
npm install
npm run dev
```

### Training Data

The model trainer uses the [Kaggle Store Item Demand Forecasting](https://www.kaggle.com/c/demand-forecasting-kernels-only) dataset.

Place the files in the `data/` directory at the solution root:

| File | Description | Used by trainer? |
|---|---|---|
| `data/train.csv` | 913,000 rows of daily sales across 10 stores × 50 items, 2013–2017 | ✅ Yes — default input |

The trainer groups rows by `item`, trains a separate SSA model per product, and saves each to `MySupplyChain.Infrastructure/MLModels/`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Lucide React |
| Runtime | .NET 10 / ASP.NET Core 10 |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL 16 / Adminer |
| Auth | JWT Bearer + ASP.NET Core Identity |
| ML | ML.NET 5.0 (SSA Time Series) |
| CQRS | MediatR 14 |
| Testing | xUnit + Moq + FluentAssertions |
| Containerization | Docker + Docker Compose |

## License

[MIT](LICENSE)

