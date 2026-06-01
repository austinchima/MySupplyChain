using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Exceptions;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Orders.Commands.CreateOrder;
using MySupplyChain.Domain.Entities;
using MySupplyChain.Domain.Enums;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.Tests.Application.Orders;

public class CreateOrderCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IDemandForecaster> _forecasterMock;
    private readonly CreateOrderCommandHandler _handler;

    public CreateOrderCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _context = new ApplicationDbContext(options, httpContextAccessorMock.Object);

        // Set tenant context for unit tests (background job pattern)
        _context.SetTenantContext("test-user-id");

        _forecasterMock = new Mock<IDemandForecaster>();

        _handler = new CreateOrderCommandHandler(_context, _forecasterMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReduceStock_WhenInventoryIsSufficient()
    {
        // Arrange
        var product = new Product { Id = 1, Name = "Item A", CurrentStock = 100, ReorderPoint = 5 };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var command = new CreateOrderCommand(product.Id, 20);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(80);
        product.CurrentStock.Should().Be(80);
    }

    [Fact]
    public async Task Handle_ShouldTriggerAIReorder_WhenStockFallsBelowThreshold()
    {
        // Arrange
        var product = new Product { Id = 2, Name = "Low Stock Item", Sku = "LSI-001", CurrentStock = 10, ReorderPoint = 15 };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var mockForecast = new ForecastResult
        {
            ForecastedUnits = Enumerable.Repeat(50f, 30).ToArray(),
            LowerBound = Enumerable.Repeat(40f, 30).ToArray(),
            UpperBound = Enumerable.Repeat(60f, 30).ToArray(),
            Rmse = 5.0f,
            Mae = 4.0f
        };

        _forecasterMock.Setup(f => f.PredictDemandAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<IEnumerable<float>>(), It.IsAny<int>()))
            .ReturnsAsync(mockForecast);

        var command = new CreateOrderCommand(product.Id, 2);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        var reorder = await _context.ReorderRequests.FirstOrDefaultAsync(r => r.ProductId == product.Id);
        reorder.Should().NotBeNull();
        reorder!.Status.Should().Be(Status.Pending);
        reorder.QuantityToOrder.Should().BeGreaterThan(0);
        reorder.Justification.Should().Contain("SSA Forecast");
        reorder.Justification.Should().Contain("RMSE=");
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenStockIsInsufficient()
    {
        // Arrange
        var product = new Product { Id = 3, Name = "Empty Item", CurrentStock = 5 };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var command = new CreateOrderCommand(product.Id, 10);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(act);
        Assert.True(exception.Errors.ContainsKey("Quantity"));
    }

    [Fact]
    public async Task Handle_ShouldRecordSalesHistory_WhenOrderSucceeds()
    {
        // Arrange
        var product = new Product { Id = 4, Name = "Tracked Item", Sku = "TRK-001", CurrentStock = 50, ReorderPoint = 5 };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var command = new CreateOrderCommand(product.Id, 10);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        var sales = await _context.SalesHistories.Where(s => s.ProductId == product.Id).ToListAsync();
        sales.Should().HaveCount(1);
        sales[0].QuantitySold.Should().Be(10);
        sales[0].Sku.Should().Be("TRK-001");
    }
}
