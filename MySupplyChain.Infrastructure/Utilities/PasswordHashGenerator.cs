using Microsoft.AspNetCore.Identity;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.Utilities;

/// <summary>
/// Utility to generate password hashes for seeding data
/// Run this once to get the hashes, then use the static values in ApplicationDbContext
/// </summary>
public static class PasswordHashGenerator
{
    public static void GenerateHashes()
    {
        var hasher = new PasswordHasher<User>();
        
        // Generate hash for "Admin@123"
        var adminHash = hasher.HashPassword(null!, "Admin@123");
        Console.WriteLine($"Admin password hash: {adminHash}");
        
        // Generate hash for "User@123"
        var userHash = hasher.HashPassword(null!, "User@123");
        Console.WriteLine($"User password hash: {userHash}");
    }
}