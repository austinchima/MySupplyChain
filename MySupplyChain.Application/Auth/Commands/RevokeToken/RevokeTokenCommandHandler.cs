using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.RevokeToken;

public class RevokeTokenCommandHandler(IAuthService authService) : IRequestHandler<RevokeTokenCommand>
{
    public async Task Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        await authService.RevokeAsync(request.Token);
    }
}
