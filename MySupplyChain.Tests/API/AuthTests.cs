using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using MySupplyChain.Application.Auth.Commands.Register;
using MySupplyChain.Application.Auth.Queries.Login;

namespace MySupplyChain.Tests.API;

public class AuthTests(WebApplicationFactory<Program> factory) : BaseIntegrationTest(factory)
{
    [Fact]
    public async Task Register_ShouldCreateUser_WhenValidDataProvided()
    {
        // Arrange
        var client = Factory.CreateClient();
        var command = new RegisterCommand("newuser", "new@example.com", "Password123!");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/register", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("User registered successfully");
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUserAlreadyExists()
    {
        // Arrange
        var client = Factory.CreateClient();
        var command = new RegisterCommand("duplicate", "duplicate@example.com", "Password123!");
        await client.PostAsJsonAsync("/api/auth/register", command);

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/register", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var client = Factory.CreateClient();
        var username = "logintest";
        var password = "Password123!";
        var email = "login@example.com";
        await client.PostAsJsonAsync("/api/auth/register", new RegisterCommand(username, email, password));

        var query = new LoginQuery(email, password);

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", query);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDtO>();
        result?.Token.Should().NotBeNullOrEmpty();
    }

    private class LoginResponseDtO
    {
        public string Token { get; init; } = string.Empty;
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid()
    {
        // Arrange
        var client = Factory.CreateClient();
        var query = new LoginQuery("nonexistent@example.com", "WrongPass123!");

        // Act
        var response = await client.PostAsJsonAsync("/api/auth/login", query);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
