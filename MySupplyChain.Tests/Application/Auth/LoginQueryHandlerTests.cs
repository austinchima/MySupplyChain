using MySupplyChain.Application.Auth.Queries.Login;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Tests.Application.Auth;

public class LoginQueryHandlerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly LoginQueryHandler _handler;

    public LoginQueryHandlerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _handler = new LoginQueryHandler(_authServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnToken_WhenCredentialsAreCorrect()
    {
        // Arrange
        var query = new LoginQuery("user@example.com", "Password123!", "device1");
        var expectedResult = new MySupplyChain.Application.Auth.Common.AuthResult { AccessToken = "valid.jwt.token", RefreshToken = "valid.refresh.token" };
        
        _authServiceMock.Setup(x => x.LoginAsync(query.UsernameOrEmail, query.Password, query.DeviceInfo))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(expectedResult);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenLoginFails()
    {
        // Arrange
        var query = new LoginQuery("wrong@example.com", "bad", "device1");
        _authServiceMock.Setup(x => x.LoginAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((MySupplyChain.Application.Auth.Common.AuthResult?)null);

        // Act
        Func<Task> act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
