using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.Authentication;

/// <summary>
/// Service for user authentication and JWT token generation.
/// Login is email-only; usernames are display names and may be duplicated.
/// </summary>
public class AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IOptions<JwtSettings> jwtSettings)
    : IAuthService
{
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    public async Task<User> RegisterAsync(string username, string email, string password)
    {
        // Uniqueness is enforced on email only — usernames are display names
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            throw new Application.Common.Exceptions.ValidationException(new Dictionary<string, string[]>
            {
                { "User", ["An account with this email address already exists."] }
            });
        }

        var user = new User
        {
            UserName = username,
            Email = email,
            Role = Domain.Enums.Role.User,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var errors = result.Errors
                .GroupBy(e => e.Code, e => e.Description)
                .ToDictionary(g => g.Key, g => g.ToArray());

            throw new Application.Common.Exceptions.ValidationException(errors);
        }

        return user;
    }

    public async Task<string?> LoginAsync(string usernameOrEmail, string password)
    {
        // Resolve user by email only (usernames are not unique)
        var user = await userManager.FindByEmailAsync(usernameOrEmail);

        if (user == null)
        {
            return null;
        }

        // Verify password
        var result = await signInManager.CheckPasswordSignInAsync(user, password, false);

        if (!result.Succeeded)
        {
            return null;
        }

        // Generate JWT token
        return GenerateJwtToken(user);
    }

    public async Task DeleteAccountAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user != null)
        {
            await userManager.DeleteAsync(user);
        }
    }

    public async Task<string> UpdateUsernameAsync(string userId, string newUsername, string currentPassword)
    {
        var user = await userManager.FindByIdAsync(userId) ?? throw new Application.Common.Exceptions.NotFoundException(nameof(User), userId);

        // Verify current password before allowing username change
        var passwordCheck = await signInManager.CheckPasswordSignInAsync(user, currentPassword, false);
        if (!passwordCheck.Succeeded)
        {
            throw new UnauthorizedAccessException("Current password is incorrect.");
        }

        user.UserName = newUsername;
        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = result.Errors
                .GroupBy(e => e.Code, e => e.Description)
                .ToDictionary(g => g.Key, g => g.ToArray());

            throw new Application.Common.Exceptions.ValidationException(errors);
        }

        return GenerateJwtToken(user);
    }

    public string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id), // Id is string now
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
