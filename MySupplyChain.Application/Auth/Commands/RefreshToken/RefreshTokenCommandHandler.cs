using MediatR;
using MySupplyChain.Application.Auth.Common;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler(IAuthService authService) : IRequestHandler<RefreshTokenCommand, AuthResult>
{
    public async Task<AuthResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        return await authService.RefreshAsync(request.Token, request.DeviceInfo);
    }
}
