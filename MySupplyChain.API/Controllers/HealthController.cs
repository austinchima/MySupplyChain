using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IDemandForecaster _forecaster;
    private readonly ILogger<HealthController> _logger;

    public HealthController(IDemandForecaster forecaster, ILogger<HealthController> logger)
    {
        _forecaster = forecaster;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var health = new
        {
            ModelLoaded = _forecaster.IsModelLoaded,
            Uptime = (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalSeconds
        };

        _logger.LogInformation("Health check requested. ModelLoaded={ModelLoaded}", health.ModelLoaded);
        return Ok(health);
    }
}
