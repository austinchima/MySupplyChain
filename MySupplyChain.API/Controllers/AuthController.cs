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
public class AuthController(IMediator mediator, IWebHostEnvironment env) : ControllerBase
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
    /// <param name="request">The login credentials including email and password.</param>
    /// <returns>A JWT token and success message.</returns>
    /// <response code="200">Login successful and token returned</response>
    /// <response code="401">Invalid credentials</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Login(LoginRequest request)
    {
        var deviceInfo = Request.Headers.UserAgent.ToString() ?? "";
        var query = new LoginQuery(request.Email, request.Password, deviceInfo);
        var authResult = await mediator.Send(query);

        if (authResult == null) return Unauthorized(new { Message = "Invalid credentials" });

        var isDev = env.IsDevelopment();
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDev,
            SameSite = isDev ? SameSiteMode.Lax : SameSiteMode.Strict,
            Path = "/api/auth",
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", authResult.RefreshToken, options);

        return Ok(new { Token = authResult.AccessToken, Message = "Login successful" });
    }

    /// <summary>
    /// Reset all business ledger data (keeps profile)
    /// </summary>
    [Authorize]
    [HttpDelete("reset-ledger")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResetLedger()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await mediator.Send(new WipeUserDataCommand(userId));
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

    /// <summary>
    /// Update user's username (display name) — requires current password for verification
    /// </summary>
    [Authorize]
    [HttpPut("username")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> UpdateUsername([FromBody] UpdateUsernameDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var token = await mediator.Send(new MySupplyChain.Application.Auth.Commands.UpdateUsername.UpdateUsernameCommand(userId, dto.NewUsername, dto.CurrentPassword));
        return Ok(new { Token = token, Message = "Username updated successfully" });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Refresh()
    {
        var rawToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return Unauthorized(new { Message = "Refresh token is required." });
        }

        var deviceInfo = Request.Headers.UserAgent.ToString() ?? "";
        try
        {
            var authResult = await mediator.Send(new MySupplyChain.Application.Auth.Commands.RefreshToken.RefreshTokenCommand(rawToken, deviceInfo));
            
            var isDev = env.IsDevelopment();
            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDev,
                SameSite = isDev ? SameSiteMode.Lax : SameSiteMode.Strict,
                Path = "/api/auth",
                Expires = DateTime.UtcNow.AddDays(7)
            };

            Response.Cookies.Append("refreshToken", authResult.RefreshToken, options);

            return Ok(new { Token = authResult.AccessToken, Message = "Refresh successful" });
        }
        catch (UnauthorizedAccessException ex)
        {
            Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<ActionResult> Revoke()
    {
        var rawToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrWhiteSpace(rawToken))
        {
            await mediator.Send(new MySupplyChain.Application.Auth.Commands.RevokeToken.RevokeTokenCommand(rawToken));
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
        return Ok(new { Message = "Token revoked successfully." });
    }
}

public record UpdateUsernameDto(string NewUsername, string CurrentPassword);
public record LoginRequest(
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "A valid email address is required.")]
    string Email,
    [System.ComponentModel.DataAnnotations.Required]
    string Password);
