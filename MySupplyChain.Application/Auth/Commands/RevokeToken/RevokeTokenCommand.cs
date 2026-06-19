using MediatR;

namespace MySupplyChain.Application.Auth.Commands.RevokeToken;

public record RevokeTokenCommand(string Token) : IRequest;
