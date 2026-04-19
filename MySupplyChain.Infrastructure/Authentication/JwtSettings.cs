namespace MySupplyChain.Infrastructure.Authentication;

/// <summary>
/// Configuration settings for JWT token generation
/// </summary>
public class JwtSettings
{
    public required string Secret { get; set; }
    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public uint ExpiryMinutes { get; set; } = 60;
}
