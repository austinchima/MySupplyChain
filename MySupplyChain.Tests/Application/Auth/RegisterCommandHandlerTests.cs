using MySupplyChain.Application.Auth.Commands.Register;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Tests.Application.Auth;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _handler = new RegisterCommandHandler(_authServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnUserId_WhenRegistrationIsSuccessful()
    {
        // Arrange
        var command = new RegisterCommand("newuser", "new@example.com", "Password123!");
        var expectedUserId = "guid-123";
        
        _authServiceMock.Setup(x => x.RegisterAsync(command.Username, command.Email, command.Password))
            .ReturnsAsync(new User { Id = expectedUserId });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(expectedUserId);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenServiceFails()
    {
        // Arrange
        var command = new RegisterCommand("fail", "fail@example.com", "pass");
        _authServiceMock.Setup(x => x.RegisterAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new InvalidOperationException("User exists"));

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
