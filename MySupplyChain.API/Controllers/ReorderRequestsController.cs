using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.ReorderRequests.Queries.GetReorderRequests;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ReorderRequestsController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Get all reorder requests with AI justifications
    /// </summary>
    /// <remarks>
    /// Retrieves a list of products that need reordering, including AI-generated justifications based on sales forecasts.
    /// </remarks>
    /// <returns>A list of reorder requests.</returns>
    /// <response code="200">Reorder requests retrieved successfully</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<ReorderRequestDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ReorderRequestDto>>> GetReorderRequests()
    {
        var result = await mediator.Send(new GetReorderRequestsQuery());
        return Ok(result);
    }
}
