using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.Persistence;

/// <summary>
/// EF Core implementation of the database context
/// </summary>
public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    IHttpContextAccessor httpContextAccessor)
    : IdentityDbContext<User>(options), IApplicationDbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<SalesHistory> SalesHistories => Set<SalesHistory>();
    public DbSet<ReorderRequest> ReorderRequests => Set<ReorderRequest>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Customer> Customers => Set<Customer>();
    // User DbSet is inherited from IdentityDbContext

    private string? CurrentUserId => httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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
            // Allow duplicate usernames by making the NormalizedUserName index non-unique
            entity.HasIndex(u => u.NormalizedUserName).IsUnique(false);
        });

        // Set global query filters for multi-tenancy
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<SalesHistory>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<ReorderRequest>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<Order>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<Customer>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<OrderItem>().HasQueryFilter(e => e.UserId == CurrentUserId);

        // SEED DATA
        var staticDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);


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

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentUserId = CurrentUserId;

        foreach (var entry in ChangeTracker.Entries<EntityBase>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    if (string.IsNullOrEmpty(entry.Entity.UserId))
                    {
                        entry.Entity.UserId = currentUserId;
                    }
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
