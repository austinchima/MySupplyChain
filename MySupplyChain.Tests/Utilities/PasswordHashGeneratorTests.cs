using Microsoft.AspNetCore.Identity;
using MySupplyChain.Domain.Entities;
using Xunit.Abstractions;

namespace MySupplyChain.Tests.Utilities;

public class PasswordHashGeneratorTests
{
    private readonly ITestOutputHelper _output;

    public PasswordHashGeneratorTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void GeneratePasswordHashes()
    {
        var hasher = new PasswordHasher<User>();
        
        // Generate hash for "Admin@123"
        var adminHash = hasher.HashPassword(null!, "Admin@123");
        _output.WriteLine($"Admin password hash for 'Admin@123':");
        _output.WriteLine(adminHash);
        _output.WriteLine("");
        
        // Generate hash for "User@123"
        var userHash = hasher.HashPassword(null!, "User@123");
        _output.WriteLine($"User password hash for 'User@123':");
        _output.WriteLine(userHash);
        _output.WriteLine("");
        
        _output.WriteLine("Copy these hashes to ApplicationDbContext.cs");
        
        // Verify the hashes work
        var adminResult = hasher.VerifyHashedPassword(null!, adminHash, "Admin@123");
        var userResult = hasher.VerifyHashedPassword(null!, userHash, "User@123");
        
        Assert.Equal(PasswordVerificationResult.Success, adminResult);
        Assert.Equal(PasswordVerificationResult.Success, userResult);
    }
}