using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Orders.Commands.CreateOrder;
using MySupplyChain.Domain.Entities;
using MySupplyChain.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Domain.Enums;

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

        _context = new ApplicationDbContext(options);
        _forecasterMock = new Mock<IDemandForecaster>();

        _handler = new CreateOrderCommandHandler(_context, _forecasterMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReduceStock_WhenSufficientStockExists()
    {
        // Arrange
        var product = new Product
        {
            Id = 1,
            Name = "Test Product",
            CurrentStock = 100,
            ReorderPoint = 10 // Low reorder point so it doesn't trigger
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var command = new CreateOrderCommand(product.Id, 10);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(90);
        var dbProduct = await _context.Products.FindAsync(product.Id);
        dbProduct!.CurrentStock.Should().Be(90);
    }

    [Fact]
    public async Task Handle_ShouldCreateReorderRequest_WhenStockFallsBelowThreshold()
    {
        // Arrange
        var product = new Product
        {
            Id = 2,
            Name = "Low Stock Product",
            CurrentStock = 15,
            ReorderPoint = 10
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Forecaster setup
        _forecasterMock.Setup(f => f.PredictDemandAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<List<float>>()))
            .ReturnsAsync(50f);

        // Order 10 items -> Stock becomes 5 (<= 10) -> Trigger reorder
        var command = new CreateOrderCommand(product.Id, 10);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        var reorder = await _context.ReorderRequests.FirstOrDefaultAsync(r => r.ProductId == product.Id);
        reorder.Should().NotBeNull();
        reorder.Status.Should().Be(Status.Pending);
        reorder.QuantityToOrder.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenInsufficientStock()
    {
        // Arrange
        var product = new Product
        {
            Id = 3,
            Name = "Scarce Product",
            CurrentStock = 5
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var command = new CreateOrderCommand(product.Id, 10);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
    }
}
