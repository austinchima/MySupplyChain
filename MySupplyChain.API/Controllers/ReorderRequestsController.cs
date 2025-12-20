using MediatR;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.ReorderRequests.Queries.GetReorderRequests;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReorderRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReorderRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all reorder requests with AI justifications
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ReorderRequestDto>>> GetReorderRequests()
    {
        var result = await _mediator.Send(new GetReorderRequestsQuery());
        return Ok(result);
    }
}
