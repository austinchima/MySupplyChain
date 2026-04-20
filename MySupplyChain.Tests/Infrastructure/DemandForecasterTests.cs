using Microsoft.Extensions.Logging;
using MySupplyChain.Infrastructure.MachineLearning;

namespace MySupplyChain.Tests.Infrastructure;

public class DemandForecasterTests
{
    private readonly Mock<ILogger<DemandForecaster>> _loggerMock = new();
    private readonly string _dummyModelPath = "non_existent_model.zip";

    [Fact]
    public async Task PredictDemandAsync_ShouldFallbackToMovingAverage_WhenMLModelIsMissing()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var historicalSales = new List<float> { 10, 20, 30 }; // Average = 20

        // Act
        var result = await forecaster.PredictDemandAsync(1, "SKU-001", historicalSales);

        // Assert
        result.Should().Be(20);
    }

    [Fact]
    public async Task PredictDemandAsync_ShouldReturnZero_WhenNoHistoryIsProvided()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var emptyHistory = Enumerable.Empty<float>();

        // Act
        var result = await forecaster.PredictDemandAsync(1, "SKU-002", emptyHistory);

        // Assert
        result.Should().Be(0);
    }
}
