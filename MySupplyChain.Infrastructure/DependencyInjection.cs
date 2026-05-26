using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Infrastructure.Authentication;
using MySupplyChain.Infrastructure.MachineLearning;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.Infrastructure;

/// <summary>
/// Registers Infrastructure layer services (EF Core, ML.NET, Authentication)
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register EF Core with PostgreSQL provider
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.")));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Register ML.NET Demand Forecaster via factory so ILogger can be injected
        var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MLModels", "sales_model.zip");
        services.AddSingleton<IDemandForecaster>(provider =>
        {
            var logger = provider.GetRequiredService<ILogger<DemandForecaster>>();
            return new DemandForecaster(modelPath, logger);
        });

        // Register Authentication services
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.AddScoped<IAuthService, AuthService>();

        if (jwtSettings != null)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
                };
            });
        }

        return services;
    }
}

