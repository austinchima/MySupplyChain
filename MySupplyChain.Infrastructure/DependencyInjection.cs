using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Infrastructure.MachineLearning;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.Infrastructure;

/// <summary>
/// Registers Infrastructure layer services (EF Core, ML.NET)
/// </summary>

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

        services.AddScoped<IApplicationDbContext>(provider => 
            provider.GetRequiredService<ApplicationDbContext>());

        // Register ML.NET Demand Forecaster
        var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MLModels", "sales_model.zip");
        services.AddSingleton<IDemandForecaster>(new DemandForecaster(modelPath));

        return services;
    }
}

