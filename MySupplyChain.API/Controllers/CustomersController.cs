using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Customers.Queries.GetCustomers;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CustomersController(IMediator mediator, ILogger<CustomersController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CustomerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetAll()
    {
        logger.LogInformation("Getting all customers");
        var customers = await mediator.Send(new GetCustomersQuery());
        return Ok(customers);
    }
}
