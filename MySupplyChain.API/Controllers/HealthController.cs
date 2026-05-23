using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
    : ControllerBase
{
    /// <summary>
    /// Basic health check endpoint
    /// </summary>
    /// <returns>A simple status message indicating the API is running.</returns>
    /// <response code="200">API is healthy</response>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0"
        });
    }

    /// <summary>
    /// Detailed health check including database connectivity
    /// </summary>
    /// <returns>A detailed health report including API, Database, and ML Model status.</returns>
    /// <response code="200">System is fully healthy</response>
    /// <response code="503">System is unhealthy (e.g. database down)</response>
    [HttpGet("detailed")]
    [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetDetailed()
    {
        var healthChecks = new Dictionary<string, object>
        {
            { "api", "Healthy" },
            { "timestamp", DateTime.UtcNow },
            { "version", "1.0.0" }
        };

        // Check database connectivity
        try
        {
            await context.Database.CanConnectAsync();
            healthChecks.Add("database", "Healthy");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database health check failed");
            healthChecks.Add("database", "Unhealthy");
            return StatusCode(503, healthChecks);
        }

        // Check if ML model file exists
        var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MLModels", "sales_model.zip");
        healthChecks.Add("mlModel", System.IO.File.Exists(modelPath) ? "Healthy" : "Unhealthy");

        return Ok(healthChecks);
    }
}
