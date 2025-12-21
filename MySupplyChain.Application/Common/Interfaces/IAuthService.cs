using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Application.Common.Interfaces;

/// <summary>
/// Interface for authentication services
/// Used by RegisterCommandHandler and LoginQueryHandler through dependency injection
/// </summary>
///

[System.Diagnostics.CodeAnalysis.SuppressMessage("Usage", "IDE0051:Remove unused private members")]
public interface IAuthService
{
    /// <summary>
    /// Used by RegisterCommandHandler
    /// </summary>
    Task<User> RegisterAsync(string username, string email, string password);

    /// <summary>
    /// Used by LoginQueryHandler
    /// </summary>
    Task<string?> LoginAsync(string usernameOrEmail, string password);

    string GenerateJwtToken(User user);
}

