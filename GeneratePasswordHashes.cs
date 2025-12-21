using Microsoft.AspNetCore.Identity;

// Simple utility to generate password hashes for seeding
var hasher = new PasswordHasher<object>();

// Generate hash for "Admin@123"
var adminHash = hasher.HashPassword(null!, "Admin@123");
Console.WriteLine($"Admin password hash for 'Admin@123':");
Console.WriteLine(adminHash);
Console.WriteLine();

// Generate hash for "User@123"
var userHash = hasher.HashPassword(null!, "User@123");
Console.WriteLine($"User password hash for 'User@123':");
Console.WriteLine(userHash);
Console.WriteLine();

Console.WriteLine("Copy these hashes to ApplicationDbContext.cs");