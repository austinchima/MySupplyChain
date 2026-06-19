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
    Task<MySupplyChain.Application.Auth.Common.AuthResult?> LoginAsync(string usernameOrEmail, string password, string deviceInfo = "");

    /// <summary>
    /// Used by DeleteAccountCommandHandler
    /// </summary>
    Task DeleteAccountAsync(string userId);

    /// <summary>
    /// Updates the user's username after verifying the current password. Returns a new JWT token.
    /// </summary>
    Task<string> UpdateUsernameAsync(string userId, string newUsername, string currentPassword);

    Task<MySupplyChain.Application.Auth.Common.AuthResult> RefreshAsync(string refreshToken, string deviceInfo);
    
    Task RevokeAsync(string refreshToken);

    string GenerateJwtToken(User user);
}

