using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Products.Commands.CreateProduct;
using MySupplyChain.Application.Products.Commands.RestockProduct;
using MySupplyChain.Application.Products.Queries.GetAllProducts;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.Tests.API;

public class ProductsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ProductsControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                // Register InMemory DbContext                // Add InMemory DbContext with constant name to share across requests
                var dbName = "TestDb_" + Guid.NewGuid();
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));

                services.AddScoped<IApplicationDbContext>(provider =>
                    provider.GetRequiredService<ApplicationDbContext>());

                // Register Mock Forecaster
                var forecasterMock = new Mock<IDemandForecaster>();
                forecasterMock.Setup(f => f.PredictDemandAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<IEnumerable<float>>()))
                    .ReturnsAsync(50f);
                services.AddSingleton(forecasterMock.Object);
            });
        });
    }

    [Fact]
    public async Task CreateAndRestockProduct_ShouldUpdateStock()
    {
        var client = _factory.CreateClient();

        // 1. Create Product
        var createCommand = new CreateProductCommand
        {
            Name = "Test Product",
            Sku = "SKU-123",
            Price = 10.0m,
            CurrentStock = 100,
            ReorderPoint = 10
        };
        var createResponse = await client.PostAsJsonAsync("/api/products", createCommand);

        if (!createResponse.IsSuccessStatusCode)
        {
            var error = await createResponse.Content.ReadAsStringAsync();
            throw new Exception($"CreateProduct failed: {createResponse.StatusCode} - {error}");
        }
        // Extract ID from Location header or response body if applicable. 
        // Controller returns CreatedAtAction with id.
        // But response body is just int? Let's check controller. 
        // It returns CreatedAtAction(..., productId).
        // Standard deserialization might be tricky if it's just an int in body.

        // Let's assume response body is the integer ID.
        var productId = await createResponse.Content.ReadFromJsonAsync<int>();

        // 2. Initial Get
        var getInitial = await client.GetAsync("/api/products");
        var initialProducts = await getInitial.Content.ReadFromJsonAsync<List<ProductDto>>();
        initialProducts.Should().Contain(p => p.Id == productId && p.Name == "Test Product");

        // 3. Restock
        var restockCommand = new RestockProductCommand(productId, 50);
        var restockResponse = await client.PostAsJsonAsync($"/api/products/{productId}/restock", restockCommand);
        restockResponse.EnsureSuccessStatusCode();

        // 4. Verify Stock
        var getAfter = await client.GetAsync("/api/products");
        var finalProducts = await getAfter.Content.ReadFromJsonAsync<List<ProductDto>>();
        var product = finalProducts!.First(p => p.Id == productId);
        product.CurrentStock.Should().Be(150);
    }
}
