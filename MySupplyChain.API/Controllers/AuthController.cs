using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Auth.Commands.DeleteAccount;
using MySupplyChain.Application.Auth.Commands.Register;
using MySupplyChain.Application.Auth.Commands.WipeUserData;
using MySupplyChain.Application.Auth.Queries.Login;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Register a new user
    /// </summary>
    /// <remarks>
    /// creates a new user account with the provided credentials.
    /// </remarks>
    /// <param name="command">The registration details including username, email, and password.</param>
    /// <returns>A success message and the ID of the newly created user.</returns>
    /// <response code="200">User registered successfully</response>
    /// <response code="400">Invalid registration details or user already exists</response>
    
    
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Register(RegisterCommand command)
    {
        var userId = await mediator.Send(command);
        return Ok(new { UserId = userId, Message = "User registered successfully" });
    }

    /// <summary>
    /// Login and receive JWT token
    /// </summary>
    /// <remarks>
    /// Authenticates a user and returns a JWT token for accessing protected endpoints.
    /// </remarks>
    /// <param name="query">The login credentials including email and password.</param>
    /// <returns>A JWT token and success message.</returns>
    /// <response code="200">Login successful and token returned</response>
    /// <response code="401">Invalid credentials</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Login(LoginQuery query)
    {
        var token = await mediator.Send(query);
        return Ok(new { Token = token, Message = "Login successful" });
    }

    /// <summary>
    /// Reset all business ledger data (keeps profile)
    /// </summary>
    [Authorize]
    [HttpDelete("reset-ledger")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResetLedger()
    {
        await mediator.Send(new WipeUserDataCommand());
        return NoContent();
    }

    /// <summary>
    /// Permanently delete account and all data
    /// </summary>
    [Authorize]
    [HttpDelete("account")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await mediator.Send(new DeleteAccountCommand(userId));
        return NoContent();
    }
}
