using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using FluentAssertions;
using MySupplyChain.Application.Common.Exceptions;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Orders.Commands.CreateOrder;
using MySupplyChain.Domain.Entities;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.Tests.Application.Orders;

public class CreateOrderCommandHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IEventIngestionChannel> _channelMock;
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

        _channelMock = new Mock<IEventIngestionChannel>();

        _handler = new CreateOrderCommandHandler(_context, _channelMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldPushEvent_WhenInventoryIsSufficient()
    {
        // Arrange
        var product = new Product { Id = 1, Name = "Item A", CurrentStock = 100, ReorderPoint = 5 };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var command = new CreateOrderCommand(product.Id, 20);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(80); // Returns optimistic projection

        // Verify channel push
        _channelMock.Verify(c => c.PushEventAsync(It.Is<SupplyChainEvent>(e =>
            e.EventType == "OrderPlaced" &&
            e.Payload.Contains($"\"ProductId\":{product.Id}") &&
            e.Payload.Contains("\"Quantity\":20")
        ), CancellationToken.None), Times.Once);
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

        // Verify no event pushed
        _channelMock.Verify(c => c.PushEventAsync(It.IsAny<SupplyChainEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
