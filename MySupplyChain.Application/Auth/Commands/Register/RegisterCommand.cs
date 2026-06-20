using MediatR;
using System.ComponentModel.DataAnnotations;

namespace MySupplyChain.Application.Auth.Commands.Register;

public record RegisterCommand(
    [Required] string Username,
    [Required] [EmailAddress(ErrorMessage = "A valid email address is required.")] string Email,
    [Required] string Password) : IRequest<string>;
