using MySupplyChain.Infrastructure.MachineLearning;
using Microsoft.Extensions.Logging;

namespace MySupplyChain.Tests.Infrastructure;

public class DemandForecasterTests
{
    private readonly Mock<ILogger<DemandForecaster>> _loggerMock = new();
    private readonly string _dummyModelPath = "non_existent_model.zip";

    [Fact]
    public async Task PredictDemandAsync_ShouldReturnAverage_WhenModelNotLoaded()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var history = new List<float> { 10, 20, 30 }; // Avg = 20

        // Act
        var result = await forecaster.PredictDemandAsync(1, history);

        // Assert
        result.Should().Be(20);
    }

    [Fact]
    public async Task PredictDemandAsync_ShouldReturnZero_WhenHistoryEmpty()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var history = Enumerable.Empty<float>();

        // Act
        var result = await forecaster.PredictDemandAsync(1, history);

        // Assert
        result.Should().Be(0);
    }
}
