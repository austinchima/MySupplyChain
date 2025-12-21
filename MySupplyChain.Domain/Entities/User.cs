using Microsoft.AspNetCore.Identity;
using MySupplyChain.Domain.Enums;

namespace MySupplyChain.Domain.Entities;

/// <summary>
/// User entity for authentication and authorization
/// </summary>
// Inherit from IdentityUser, which provides Id, UserName, Email, PasswordHash, etc.
public class User : IdentityUser
{
    // Custom properties
    public Role Role { get; set; } = Role.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
