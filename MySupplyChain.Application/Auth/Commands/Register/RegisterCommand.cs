using MediatR;

namespace MySupplyChain.Application.Auth.Commands.Register;

public record RegisterCommand(string Username, string Email, string Password) : IRequest<string>;
