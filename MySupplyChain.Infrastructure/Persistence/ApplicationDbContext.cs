using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.Persistence;

/// <summary>
/// EF Core implementation of the database context
/// </summary>
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User>(options), IApplicationDbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<SalesHistory> SalesHistories => Set<SalesHistory>();
    public DbSet<ReorderRequest> ReorderRequests => Set<ReorderRequest>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();
    // User DbSet is inherited from IdentityDbContext

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        
        // Suppress the pending model changes warning for seeded data
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Product entity
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(18, 2);
        });

        // Configure SalesHistory entity
        modelBuilder.Entity<SalesHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Product)
                .WithMany(p => p.SalesHistory)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ReorderRequest entity
        modelBuilder.Entity<ReorderRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.PredictedDemand).HasPrecision(18, 2);
        });

        // Configure User entity
        // IdentityUser configuration is handled by base.OnModelCreating
        // We can add additional configs for custom properties if needed
        modelBuilder.Entity<User>(entity =>
        {
            // IdentityUser uses string Id by default.
            entity.Property(e => e.Role).IsRequired();
            // Identity handles UserName/Email uniqueness
        });

        // SEED DATA
        var staticDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Name = "Laptop Dell XPS 13",
                Sku = "DELL-XPS-001",
                CurrentStock = 50,
                ReorderPoint = 15,
                Price = 1299.99m,
                CreatedAt = staticDate
            },
            new Product
            {
                Id = 2,
                Name = "iPhone 15 Pro",
                Sku = "APPL-IP15-001",
                CurrentStock = 30,
                ReorderPoint = 10,
                Price = 999.99m,
                CreatedAt = staticDate
            },
            new Product
            {
                Id = 3,
                Name = "Wireless Mouse",
                Sku = "LOGI-MX-001",
                CurrentStock = 100,
                ReorderPoint = 25,
                Price = 79.99m,
                CreatedAt = staticDate
            }
        );

        // Seed historical sales data (simplified for deterministic seeding)
        modelBuilder.Entity<SalesHistory>().HasData(
            new SalesHistory { Id = 1001, ProductId = 1, Sku = "DELL-XPS-001", Date = new DateTime(2024, 1, 1), QuantitySold = 10, CreatedAt = staticDate },
            new SalesHistory { Id = 1002, ProductId = 1, Sku = "DELL-XPS-001", Date = new DateTime(2024, 1, 2), QuantitySold = 8, CreatedAt = staticDate },
            new SalesHistory { Id = 1003, ProductId = 1, Sku = "DELL-XPS-001", Date = new DateTime(2024, 1, 3), QuantitySold = 12, CreatedAt = staticDate },
            new SalesHistory { Id = 2001, ProductId = 2, Sku = "APPL-IP15-001", Date = new DateTime(2024, 1, 1), QuantitySold = 15, CreatedAt = staticDate },
            new SalesHistory { Id = 2002, ProductId = 2, Sku = "APPL-IP15-001", Date = new DateTime(2024, 1, 2), QuantitySold = 12, CreatedAt = staticDate },
            new SalesHistory { Id = 2003, ProductId = 2, Sku = "APPL-IP15-001", Date = new DateTime(2024, 1, 3), QuantitySold = 18, CreatedAt = staticDate },
            new SalesHistory { Id = 3001, ProductId = 3, Sku = "LOGI-MX-001", Date = new DateTime(2024, 1, 1), QuantitySold = 45, CreatedAt = staticDate },
            new SalesHistory { Id = 3002, ProductId = 3, Sku = "LOGI-MX-001", Date = new DateTime(2024, 1, 2), QuantitySold = 52, CreatedAt = staticDate },
            new SalesHistory { Id = 3003, ProductId = 3, Sku = "LOGI-MX-001", Date = new DateTime(2024, 1, 3), QuantitySold = 38, CreatedAt = staticDate }
        );

        // Seed default users with real password hashes
        // IDs must be strings for IdentityUser
        var adminId = "8e445865-a24d-4543-a6c6-9443d048cdb9";
        var userId = "3b333929-f974-444e-a8d3-68f50a356d51";

        // Pre-computed ASP.NET Core Identity password hashes (deterministic for seeding)
        // Admin password: "Admin@123"
        var adminPasswordHash = "AQAAAAIAAYagAAAAEMXMR7yRo+DSLWhxE7Ps46cMsJAupwpX3z7sUyw+LW6J8Ugj6c/U5UHMgltwojS/EQ==";
        // User password: "User@123"  
        var userPasswordHash = "AQAAAAIAAYagAAAAEHMM6IpS5myk37PgKXxvY7E4nck6RwAWm1fpELJWC3EFTwk8i0Ivo9BNpEt7xiwgrQ==";

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin@mysupplychain.com",
                NormalizedEmail = "ADMIN@MYSUPPLYCHAIN.COM",
                EmailConfirmed = true,
                PasswordHash = adminPasswordHash,
                Role = Domain.Enums.Role.Admin,
                CreatedAt = staticDate,
                SecurityStamp = "ADMIN-SECURITY-STAMP-STATIC"
            },
            new User
            {
                Id = userId,
                UserName = "user",
                NormalizedUserName = "USER",
                Email = "user@mysupplychain.com",
                NormalizedEmail = "USER@MYSUPPLYCHAIN.COM",
                EmailConfirmed = true,
                PasswordHash = userPasswordHash,
                Role = Domain.Enums.Role.User,
                CreatedAt = staticDate,
                SecurityStamp = "USER-SECURITY-STAMP-STATIC"
            }
        );
    }
}
