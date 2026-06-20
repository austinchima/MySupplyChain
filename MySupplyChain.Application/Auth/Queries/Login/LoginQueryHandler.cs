using MediatR;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Application.Auth.Common;

namespace MySupplyChain.Application.Auth.Queries.Login;

public class LoginQueryHandler(IAuthService authService) : IRequestHandler<LoginQuery, AuthResult?>
{
    public async Task<AuthResult?> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request.Email, request.Password, request.DeviceInfo);
        
        if (result == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return result;
    }
}
