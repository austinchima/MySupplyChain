using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Orders.Commands.CreateOrder;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrdersController(IMediator mediator, ILogger<OrdersController> logger) : ControllerBase
{
    /// <summary>
    /// Place a new order
    /// </summary>
    /// <remarks>
    /// Reduces product stock and logs the order.
    /// </remarks>
    /// <param name="command">The order details including product ID and quantity.</param>
    /// <returns>The remaining stock level and a success message.</returns>
    /// <response code="200">Order placed successfully</response>
    /// <response code="400">Invalid order details or insufficient stock</response>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> Create(CreateOrderCommand command)
    {
        logger.LogInformation("CreateOrder called for ProductId={ProductId}, Quantity={Quantity}", command.ProductId,
            command.Quantity);
        var remainingStock = await mediator.Send(command);
        return Ok(new { RemainingStock = remainingStock, Message = "Order placed successfully" });
    }
}
