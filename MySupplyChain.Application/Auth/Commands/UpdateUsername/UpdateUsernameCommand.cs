using MediatR;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Auth.Commands.UpdateUsername;

public record UpdateUsernameCommand(string UserId, string NewUsername) : IRequest<string>;

public class UpdateUsernameCommandHandler(IAuthService authService) : IRequestHandler<UpdateUsernameCommand, string>
{
    public async Task<string> Handle(UpdateUsernameCommand request, CancellationToken cancellationToken)
    {
        return await authService.UpdateUsernameAsync(request.UserId, request.NewUsername);
    }
}
