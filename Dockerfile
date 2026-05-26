FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files for layer-cached restore
COPY MySupplyChain.slnx .
COPY MySupplyChain.Domain/MySupplyChain.Domain.csproj MySupplyChain.Domain/
COPY MySupplyChain.Application/MySupplyChain.Application.csproj MySupplyChain.Application/
COPY MySupplyChain.Infrastructure/MySupplyChain.Infrastructure.csproj MySupplyChain.Infrastructure/
COPY MySupplyChain.API/MySupplyChain.API.csproj MySupplyChain.API/
COPY MySupplyChain.ModelTrainer/MySupplyChain.ModelTrainer.csproj MySupplyChain.ModelTrainer/
COPY MySupplyChain.Tests/MySupplyChain.Tests.csproj MySupplyChain.Tests/
COPY MySupplyChain.Benchmarks/MySupplyChain.Benchmarks.csproj MySupplyChain.Benchmarks/


RUN dotnet restore MySupplyChain.slnx

# Copy everything else and build
COPY . .
RUN dotnet publish MySupplyChain.API/MySupplyChain.API.csproj -c Release -o /app/publish --no-restore

# ─── Runtime ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=build /app/publish .

# Copy pre-trained ML model if it exists
COPY --from=build /src/MySupplyChain.Infrastructure/MLModels/ ./MLModels/

# Copy CSV training/seed data so the seeder can run on startup
COPY --from=build /src/data/ ../data/

USER appuser
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "MySupplyChain.API.dll"]
