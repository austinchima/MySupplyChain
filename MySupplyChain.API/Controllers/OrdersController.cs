using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Orders.Commands.CreateOrder;
using MySupplyChain.Application.Orders.Commands.DeleteOrder;
using MySupplyChain.Application.Orders.Commands.UpdateOrder;
using MySupplyChain.Application.Orders.Queries.GetOrders;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrdersController(IMediator mediator, ILogger<OrdersController> logger) : ControllerBase
{
    /// <summary>
    /// Get all orders
    /// </summary>
    /// <remarks>
    /// Retrieves all orders with customer, item count, status, and total.
    /// </remarks>
    /// <returns>A list of all orders.</returns>
    /// <response code="200">Orders retrieved successfully</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetAll()
    {
        logger.LogInformation("GetAllOrders called");
        var result = await mediator.Send(new GetOrdersQuery());
        return Ok(result);
    }

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

    /// <summary>
    /// Update an order status
    /// </summary>
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        await mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Delete an order
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        await mediator.Send(new DeleteOrderCommand(id));
        return NoContent();
    }
}
