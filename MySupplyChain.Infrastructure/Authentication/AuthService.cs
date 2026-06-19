using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
    IOptions<JwtSettings> jwtSettings,
    IApplicationDbContext dbContext)
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

    public async Task<MySupplyChain.Application.Auth.Common.AuthResult?> LoginAsync(string usernameOrEmail, string password, string deviceInfo = "")
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

        var accessToken = GenerateJwtToken(user);
        var rawRefreshToken = GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Token = HashToken(rawRefreshToken),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
            DeviceInfo = deviceInfo,
            RememberMe = true
        };

        dbContext.SetTenantContext(user.Id);
        dbContext.RefreshTokens.Add(refreshTokenEntity);
        await dbContext.SaveChangesAsync();

        // Generate JWT token
        return new MySupplyChain.Application.Auth.Common.AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken
        };
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

    public async Task<MySupplyChain.Application.Auth.Common.AuthResult> RefreshAsync(string refreshToken, string deviceInfo)
    {
        var tokenHash = HashToken(refreshToken);
        
        dbContext.ClearTenantContext();
        
        var storedToken = await dbContext.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == tokenHash);

        if (storedToken == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (storedToken.IsRevoked)
        {
            var activeTokens = await dbContext.RefreshTokens
                .Where(rt => rt.UserId == storedToken.UserId && rt.RevokedAt == null)
                .ToListAsync();

            foreach (var t in activeTokens)
            {
                t.RevokedAt = DateTime.UtcNow;
            }
            await dbContext.SaveChangesAsync();

            throw new UnauthorizedAccessException("Token reuse detected. All sessions revoked.");
        }

        if (storedToken.IsExpired)
        {
            throw new UnauthorizedAccessException("Refresh token has expired.");
        }

        var user = storedToken.User;
        var newRawToken = GenerateRefreshToken();
        var newTokenHash = HashToken(newRawToken);

        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.ReplacedByToken = newTokenHash;

        var newRefreshToken = new RefreshToken
        {
            Token = newTokenHash,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
            DeviceInfo = deviceInfo,
            RememberMe = storedToken.RememberMe
        };

        dbContext.SetTenantContext(user.Id);
        dbContext.RefreshTokens.Add(newRefreshToken);
        await dbContext.SaveChangesAsync();

        return new MySupplyChain.Application.Auth.Common.AuthResult
        {
            AccessToken = GenerateJwtToken(user),
            RefreshToken = newRawToken
        };
    }

    public async Task RevokeAsync(string refreshToken)
    {
        var tokenHash = HashToken(refreshToken);
        dbContext.ClearTenantContext();

        var storedToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == tokenHash);

        if (storedToken is { IsActive: true })
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private static string HashToken(string token)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }
}
