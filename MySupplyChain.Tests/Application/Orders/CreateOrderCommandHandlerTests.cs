using Microsoft.EntityFrameworkCore;
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

        _context = new ApplicationDbContext(options);
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
        var product = new Product { Id = 2, Name = "Low Stock Item", CurrentStock = 10, ReorderPoint = 15 };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        _forecasterMock.Setup(f => f.PredictDemandAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<IEnumerable<float>>()))
            .ReturnsAsync(50f);

        var command = new CreateOrderCommand(product.Id, 2);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        var reorder = await _context.ReorderRequests.FirstOrDefaultAsync(r => r.ProductId == product.Id);
        reorder.Should().NotBeNull();
        reorder.QuantityToOrder.Should().Be(75);
        reorder.Status.Should().Be(Status.Pending);
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
        await act.Should().ThrowAsync<Exception>().WithMessage("Insufficient stock*");
    }
}
