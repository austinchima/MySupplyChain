using MediatR;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Orders.Commands.CreateOrder;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IMediator mediator, ILogger<OrdersController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateOrderCommand command)
    {
        logger.LogInformation("CreateOrder called for ProductId={ProductId}, Quantity={Quantity}", command.ProductId, command.Quantity);
        try 
        {
            var remainingStock = await mediator.Send(command);
            return Ok(new { RemainingStock = remainingStock, Message = "Order placed successfully" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error placing order for ProductId={ProductId}", command.ProductId);
            return BadRequest(new { Error = "An error occurred processing the order" });
        }
    }
}
