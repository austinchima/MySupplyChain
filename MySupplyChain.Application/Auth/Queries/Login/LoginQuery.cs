using MediatR;

namespace MySupplyChain.Application.Auth.Queries.Login;

public record LoginQuery(string UsernameOrEmail, string Password) : IRequest<string?>;
