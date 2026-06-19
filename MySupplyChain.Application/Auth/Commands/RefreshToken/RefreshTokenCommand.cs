using MediatR;
using MySupplyChain.Application.Auth.Common;

namespace MySupplyChain.Application.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string Token, string DeviceInfo) : IRequest<AuthResult>;
