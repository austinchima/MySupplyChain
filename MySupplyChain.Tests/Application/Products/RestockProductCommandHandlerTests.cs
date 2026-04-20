using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Products.Commands.RestockProduct;
using MySupplyChain.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MySupplyChain.Tests.Application.Products;

public class RestockProductCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<DbSet<Product>> _productsMock;
    private readonly RestockProductCommandHandler _handler;

    public RestockProductCommandHandlerTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _productsMock = new Mock<DbSet<Product>>();
        
        _contextMock.Setup(c => c.Products).Returns(_productsMock.Object);
        _handler = new RestockProductCommandHandler(_contextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldIncreaseStock_WhenValidRequestPlaced()
    {
        // Arrange
        var productId = 1;
        var initialStock = 10;
        var quantityToAdd = 5;
        var product = new Product { Id = productId, CurrentStock = initialStock };

        _productsMock.Setup(m => m.FindAsync(new object[] { productId }, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        var command = new RestockProductCommand(productId, quantityToAdd);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(15);
        product.CurrentStock.Should().Be(15);
        _contextMock.Verify(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowKeyNotFoundException_WhenProductDoesNotExist()
    {
        // Arrange
        var productId = 999;
        _productsMock.Setup(m => m.FindAsync(new object[] { productId }, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        var command = new RestockProductCommand(productId, 10);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}
