using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.Register;

public class RegisterCommandHandler(IAuthService authService) : IRequestHandler<RegisterCommand, string>
{
    public async Task<string> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var user = await authService.RegisterAsync(request.Username, request.Email, request.Password);
        return user.Id;
    }
}
