using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Infrastructure.Persistence;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Tests.API;

public abstract class BaseIntegrationTest : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly string DatabaseName;

    protected BaseIntegrationTest(WebApplicationFactory<Program> factory)
    {
        Program.IsIntegrationTestRun = true;
        DatabaseName = $"TestDb_{Guid.NewGuid()}";
        Factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureTestServices(services =>
            {
                // Remove existing Ef registration (SQL Server) - be aggressive to avoid "multiple providers" error
                var descriptors = services.Where(d => 
                    d.ServiceType == typeof(ApplicationDbContext) || 
                    d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                    d.ServiceType.Name.Contains("DbContextOptions")).ToList();
                foreach (var d in descriptors) services.Remove(d);

                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(DatabaseName));

                services.AddScoped<IApplicationDbContext>(provider =>
                    provider.GetRequiredService<ApplicationDbContext>());

                // Ensure Identity services are registered fully with the new DbContext
                services.AddIdentityCore<User>()
                    .AddEntityFrameworkStores<ApplicationDbContext>()
                    .AddSignInManager()
                    .AddDefaultTokenProviders();

                // Forcefully register IAuthService
                services.AddScoped<IAuthService, MySupplyChain.Infrastructure.Authentication.AuthService>();
                
                // Customize other services if needed in derived classes
                ConfigureSubServices(services);
            });
        });
    }

    protected virtual void ConfigureSubServices(IServiceCollection services)
    {
        // Default: Mock DemandForecaster
        var forecasterMock = new Mock<IDemandForecaster>();
        var mockForecast = new ForecastResult
        {
            ForecastedUnits = Enumerable.Repeat(50f, 30).ToArray(),
            LowerBound = Enumerable.Repeat(40f, 30).ToArray(),
            UpperBound = Enumerable.Repeat(60f, 30).ToArray(),
            Rmse = 5.0f,
            Mae = 4.0f
        };
        forecasterMock.Setup(f => f.PredictDemandAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<IEnumerable<float>>(), It.IsAny<int>()))
            .ReturnsAsync(mockForecast);
        services.AddSingleton(forecasterMock.Object);
    }

    protected async Task<HttpClient> GetAuthenticatedClientAsync(string username = "testuser", string password = "Password123!")
    {
        var client = Factory.CreateClient();

        // 1. Ensure User is registered
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            Username = username,
            Email = $"{username}@example.com",
            Password = password
        });

        // 2. Login to get token
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            UsernameOrEmail = username,
            Password = password
        });

        loginResponse.EnsureSuccessStatusCode();
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult?.Token);
        
        return client;
    }

    private class LoginResponse
    {
        public string Token { get; init; } = string.Empty;
    }

    public void Dispose()
    {
        // Cleanup if needed
    }
}
