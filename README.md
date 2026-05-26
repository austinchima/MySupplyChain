# MySupplyChain — AI-Powered Time-Series Forecasting & Full-Stack Clean Architecture Showcase

[![CI](https://github.com/austinchima/MySupplyChain/actions/workflows/ci.yml/badge.svg)](https://github.com/austinchima/MySupplyChain/actions/workflows/ci.yml)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An elite, high-performance full-stack systems engineering showcase. Built with an **ASP.NET Core 10 Clean Architecture API**, a native **ML.NET demand forecasting engine (Singular Spectrum Analysis)**, and an elite **glassmorphic React TSX analytical dashboard**. 

Designed to demonstrate rich enterprise-grade software engineering, dynamic CSV stream parsing, CQRS design patterns, and high-fidelity UX performance.

---

## 🚀 Key Features

* **Instant Sandbox Bypass**: A single-click, zero-friction interactive sandbox session connecting directly to live database seeds and ML models for immediate evaluation.
* **Clean Architecture Boundaries**: Strictly segregated Domain, Application, Infrastructure, and API layers adhering to dependency inversion rules (Domain has zero third-party dependencies).
* **Singular Spectrum Analysis (SSA)**: Native C# machine learning pipelines using `Microsoft.ML.TimeSeries` to decompose historical sales into trend, seasonality, and noise.
* **Dynamic CSV Ingestion & Mapping**: Streamed drag-and-drop ingestion of arbitrary transactional logs with responsive column-matching controls for mapping raw fields to C# schemas.
* **MediatR CQRS Pipelines**: Complete separation of read/write paths utilizing MediatR handlers with automated fluent pipeline behaviors for validation and Serilog request tracking.
* **Elite 120 FPS Visual Performance**: Fast-interpolated custom cursor micro-interactions built with `gsap.quickTo` and staggered scroll-reveal timelines that drastically reduce CPU overhead.

---

## 🏗️ Architecture

```
MySupplyChain/
├── MySupplyChain.Domain          # Rich entities, enums, value objects (zero dependencies)
├── MySupplyChain.Application     # CQRS handlers, validators, interfaces, DTOs (depends on Domain)
├── MySupplyChain.Infrastructure  # EF Core, ML.NET, JWT auth, db seeds (implements Application interfaces)
├── MySupplyChain.API             # Rest Controllers, global exception middleware, composition root
├── MySupplyChain.ModelTrainer    # Offline SSA model training console app
├── MySupplyChain.UI              # Premium glassmorphic React 19 analytics dashboard (Vite + TypeScript)
├── MySupplyChain.Tests           # Unit + integration tests (23 passing)
└── MySupplyChain.slnx            # Unified C# solution file
```

### Architectural Dependency Rule
```
  [MySupplyChain.API] ──┐
                        ▼
   [MySupplyChain.Infrastructure] ──► [MySupplyChain.Application] ──► [MySupplyChain.Domain]
```

---

## 🧠 ML.NET Demand Forecasting Engine

The forecasting engine uses **Singular Spectrum Analysis (SSA)** via `Microsoft.ML.TimeSeries` to isolate periodicity, oscillation, and trend vectors from univariate sales histories.

**Seeded Database Products:**
1. `Laptop Dell XPS 13` (`DELL-XPS-001`), Stock: 50, Reorder Point: 15, Price: $1299.99
2. `iPhone 15 Pro` (`APPL-IP15-001`), Stock: 30, Reorder Point: 10, Price: $999.99
3. `Wireless Mouse` (`LOGI-MX-001`), Stock: 100, Reorder Point: 25, Price: $79.99

**Core SSA Features:**
- Multi-day horizon forecasts (default: 30 days, configurable dynamically in the UI)
- 95% confidence intervals (lower/upper bounds mapped to confidence bands on custom charts)
- Continuous evaluation metrics (RMSE, MAE)
- Automatic fallback to moving averages when model training is active

---

## 🛠️ Tech Stack & Tooling

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Frontend UI** | React 19 / TypeScript / Vite | Glassmorphism, Tailwind CSS, custom GSAP micro-animations |
| **Backend Core** | .NET 10 / ASP.NET Core 10 | Rich Domain Modeling, Clean Architecture layers |
| **Databases** | SQL Server 2022 / PostgreSQL | MediatR Fluent migrations & seed data mappings |
| **CQRS Pipeline** | MediatR 14 / FluentValidation | Separated read/write handlers, automated validation behaviors |
| **Machine Learning** | ML.NET 5.0 (TimeSeries) | Singular Spectrum Analysis (SSA) forecasting models |
| **Auth Gateway** | JWT Bearer / ASP.NET Identity | Stateless security, custom professional signup gates |
| **Structured Logging**| Serilog | High-volume rolling log files & structured JSON console outputs |
| **Unit & Integration**| xUnit / Moq / WebApplicationFactory | 23 passing tests (handling auth endpoints & lifecycle validations) |

---

## 🚀 Quick Start Guide

### Option 1: Full-Stack Docker Setup (Recommended)
Make sure you have Docker Desktop active, then run:
```bash
docker compose up --build
```
* **Frontend Dashboard**: Open `http://localhost:5173`
* **Swagger API Documentation**: Open `http://localhost:5000/swagger`

---

### Option 2: Local Development Setup

#### 1. Start C# Backend API
```bash
# Set up secure developer secrets for JWT
cd MySupplyChain.API
dotnet user-secrets init
dotnet user-secrets set "JwtSettings:Secret" "YourDevSecretKey_MustBeAtLeast32Characters!"

# Apply migrations and seeds
dotnet ef database update --project ../MySupplyChain.Infrastructure --startup-project .

# Train the ML models on seed data
dotnet run --project ../MySupplyChain.ModelTrainer -c Release

# Start the C# API
dotnet run
```
The API endpoint will be available at `http://localhost:5001`.

#### 2. Start React Visual Terminal
```bash
cd MySupplyChain.UI

# Install dependencies
npm install

# Start Vite Development server
npm run dev
```
Open `http://localhost:5173` in your browser. Click **Launch Instant Sandbox Session** on the secure gateway tab to instantly enter the analytics dashboard using pre-seeded test credentials!

---

## 🧪 Testing

```bash
# Run all 23 full-stack unit and integration tests
dotnet test
```

## 📄 License

This showcase is licensed under the [MIT License](LICENSE).
