using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Queries.Login;

public class LoginQueryHandler(IAuthService authService) : IRequestHandler<LoginQuery, string?>
{
    public async Task<string?> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var token = await authService.LoginAsync(request.UsernameOrEmail, request.Password);
        
        if (token == null)
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        return token;
    }
}
