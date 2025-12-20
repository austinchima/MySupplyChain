using MediatR;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Orders.Commands.CreateOrder;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateOrderCommand command)
    {
        try 
        {
            var remainingStock = await _mediator.Send(command);
            return Ok(new { RemainingStock = remainingStock, Message = "Order placed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
