using MediatR;
using MySupplyChain.Application.Auth.Common;

namespace MySupplyChain.Application.Auth.Queries.Login;

public record LoginQuery(string Email, string Password, string DeviceInfo = "") : IRequest<AuthResult?>;
