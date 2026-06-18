using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Suppliers.Queries.GetSupplierKpi;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SuppliersController(IMediator mediator, ILogger<SuppliersController> logger) : ControllerBase
{
    /// <summary>
    /// Get supplier KPI metrics
    /// </summary>
    /// <remarks>
    /// Returns KPI data for all active suppliers: average actual lead time,
    /// on-time delivery percentage, and total received orders.
    /// </remarks>
    /// <returns>List of SupplierKpiDto, one row per active supplier.</returns>
    /// <response code="200">KPI data retrieved successfully</response>
    [HttpGet("kpi")]
    [ProducesResponseType(typeof(IEnumerable<SupplierKpiDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<SupplierKpiDto>>> GetKpi()
    {
        logger.LogInformation("GetSupplierKpi called");
        var result = await mediator.Send(new GetSupplierKpiQuery());
        return Ok(result);
    }
}
