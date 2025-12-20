using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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
        // Register EF Core with SQLServer provider
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=mysupplychain.db"));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Register ML.NET Demand Forecaster via factory so ILogger can be injected
        var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MLModels", "sales_model.zip");
        services.AddSingleton<IDemandForecaster>(provider =>
        {
            var logger = provider.GetRequiredService<ILogger<DemandForecaster>>();
            return new DemandForecaster(modelPath, logger);
        });

        return services;
    }
}

