using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using MySupplyChain.Application.Orders.Commands.CreateOrder;
using MySupplyChain.Application.Orders.Queries.GetOrders;

namespace MySupplyChain.Tests.API;

public class OrdersControllerTests : BaseIntegrationTest
{
    public OrdersControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateOrder_WithSufficientStock_ShouldReturnOkAndReduceStock()
    {
        // Arrange
        var client = await GetAuthenticatedClientAsync("order_user1");
        
        // Setup a product
        var productResponse = await client.PostAsJsonAsync("/api/products", new
        {
            Sku = "TEST-ORDER-1",
            Name = "Order Test Product",
            Price = 100.0m,
            CurrentStock = 50,
            ReorderPoint = 10
        });
        productResponse.EnsureSuccessStatusCode();
        int productId = await productResponse.Content.ReadFromJsonAsync<int>();

        // Act
        var request = new CreateOrderCommand(productId, 20);
        var response = await client.PostAsJsonAsync("/api/orders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseData = await response.Content.ReadFromJsonAsync<dynamic>();
        int remainingStock = responseData?.GetProperty("remainingStock").GetInt32() ?? 0;
        remainingStock.Should().Be(30);

    }

    [Fact]
    public async Task CreateOrder_WithInsufficientStock_ShouldReturnBadRequest()
    {
        // Arrange
        var client = await GetAuthenticatedClientAsync("order_user2");
        
        var productResponse = await client.PostAsJsonAsync("/api/products", new
        {
            Sku = "TEST-ORDER-2",
            Name = "Low Stock Product",
            Price = 10.0m,
            CurrentStock = 5,
            ReorderPoint = 2
        });
        int productId = await productResponse.Content.ReadFromJsonAsync<int>();

        // Act
        var request = new CreateOrderCommand(productId, 10); // More than stock
        var response = await client.PostAsJsonAsync("/api/orders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var errorContent = await response.Content.ReadAsStringAsync();
        errorContent.Should().Contain("Insufficient stock");
    }
}
