using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Tests.Domain;

public class ProductTests
{
    [Fact]
    public void NewProduct_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var product = new Product();

        // Assert
        product.CurrentStock.Should().Be(0);
        product.SalesHistory.Should().BeEmpty();
    }
}
