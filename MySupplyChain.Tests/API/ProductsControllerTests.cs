using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using MySupplyChain.Application.Products.Commands.CreateProduct;
using MySupplyChain.Application.Products.Commands.RestockProduct;
using MySupplyChain.Application.Products.Queries.GetAllProducts;

namespace MySupplyChain.Tests.API;

public class ProductsControllerTests(WebApplicationFactory<Program> factory) : BaseIntegrationTest(factory)
{
    [Fact]
    public async Task AnyRequest_ShouldReturnUnauthorized_WhenNoTokenProvided()
    {
        // Arrange
        var client = Factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/products");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task FullProductLifecycle_ShouldSucceed_WhenAuthenticated()
    {
        // Arrange
        var client = await GetAuthenticatedClientAsync();
        
        // 1. Create a Product (C in CRUD)
        var createCommand = new CreateProductCommand
        {
            Name = "Refactored Product",
            Sku = "REF-123",
            Price = 99.99m,
            CurrentStock = 10,
            ReorderPoint = 5
        };
        
        var createResponse = await client.PostAsJsonAsync("/api/products", createCommand);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var productId = await createResponse.Content.ReadFromJsonAsync<int>();

        // 2. Get All Products (R in CRUD)
        var getResponse = await client.GetAsync("/api/products");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var products = await getResponse.Content.ReadFromJsonAsync<List<ProductDto>>();
        products.Should().Contain(p => p.Id == productId && p.Name == "Refactored Product");

        // 3. Restock Product (U in CRUD)
        var restockCommand = new RestockProductCommand(productId, 20);
        var restockResponse = await client.PostAsJsonAsync($"/api/products/{productId}/restock", restockCommand);
        restockResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // 4. Verify Update
        var verifyResponse = await client.GetAsync("/api/products");
        var finalProducts = await verifyResponse.Content.ReadFromJsonAsync<List<ProductDto>>();
        var product = finalProducts!.First(p => p.Id == productId);
        product.CurrentStock.Should().Be(30); // 10 + 20
    }
}
