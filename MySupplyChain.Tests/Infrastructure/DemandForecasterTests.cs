using Microsoft.Extensions.Logging;
using MySupplyChain.Infrastructure.MachineLearning;

namespace MySupplyChain.Tests.Infrastructure;

public class DemandForecasterTests
{
    private readonly Mock<ILogger<DemandForecaster>> _loggerMock = new();
    private readonly string _dummyModelPath = "non_existent_model.zip";

    [Fact]
    public async Task PredictDemandAsync_ShouldReturnFallbackForecast_WhenMLModelIsMissing()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var historicalSales = new List<float> { 10, 20, 30 }; // Average = 20

        // Act
        var result = await forecaster.PredictDemandAsync(1, "SKU-001", historicalSales);

        // Assert — fallback should produce a 30-day forecast filled with the average
        result.Should().NotBeNull();
        result.ForecastedUnits.Should().HaveCount(30);
        result.ForecastedUnits.Should().AllSatisfy(v => v.Should().Be(20f));
        result.Rmse.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task PredictDemandAsync_ShouldReturnZeroForecast_WhenNoHistoryIsProvided()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var emptyHistory = Enumerable.Empty<float>();

        // Act
        var result = await forecaster.PredictDemandAsync(1, "SKU-002", emptyHistory);

        // Assert
        result.Should().NotBeNull();
        result.ForecastedUnits.Should().HaveCount(30);
        result.ForecastedUnits.Should().AllSatisfy(v => v.Should().Be(0f));
        result.Rmse.Should().Be(0f);
        result.Mae.Should().Be(0f);
    }

    [Fact]
    public async Task PredictDemandAsync_FallbackIncludesConfidenceBounds()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var historicalSales = Enumerable.Range(1, 30).Select(i => (float)i * 2).ToList();

        // Act
        var result = await forecaster.PredictDemandAsync(1, "SKU-003", historicalSales);

        // Assert — confidence bounds should exist and lower ≤ forecast ≤ upper
        result.LowerBound.Should().HaveCount(30);
        result.UpperBound.Should().HaveCount(30);

        for (int i = 0; i < 30; i++)
        {
            result.LowerBound[i].Should().BeLessThanOrEqualTo(result.ForecastedUnits[i]);
            result.UpperBound[i].Should().BeGreaterThanOrEqualTo(result.ForecastedUnits[i]);
        }
    }

    [Fact]
    public async Task PredictDemandAsync_RespectsCustomHorizon()
    {
        // Arrange
        var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);
        var historicalSales = new List<float> { 5, 10, 15 };

        // Act
        var result = await forecaster.PredictDemandAsync(1, "SKU-004", historicalSales, horizon: 7);

        // Assert
        result.ForecastedUnits.Should().HaveCount(7);
        result.LowerBound.Should().HaveCount(7);
        result.UpperBound.Should().HaveCount(7);
    }

    [Fact]
    public Task IsModelLoaded_ShouldBeFalse_WhenModelFileDoesNotExist()
    {

        try
        {
            // Arrange & Act

            var forecaster = new DemandForecaster(_dummyModelPath, _loggerMock.Object);



            // Assert

            forecaster.IsModelLoaded.Should().BeFalse();
            return Task.CompletedTask;
        }
        catch (Exception exception)
        {
            return Task.FromException(exception);
        }

    }
}
