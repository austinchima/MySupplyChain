using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.Persistence;

/// <summary>
/// EF Core implementation of the database context with tenant isolation via global query filters.
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

    private string? _explicitTenantId;

    /// <summary>
    /// Gets the current tenant ID from either explicit context (for background jobs) or HTTP context.
    /// </summary>
    private string? CurrentUserId =>
        _explicitTenantId ?? httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    /// <summary>
    /// Sets the tenant context explicitly. Use this for background jobs and scenarios without HTTP context.
    /// Must be called before any database operations.
    /// </summary>
    /// <param name="userId">The user ID to set as the tenant context</param>
    /// <exception cref="ArgumentNullException">Thrown if userId is null or empty</exception>
    public void SetTenantContext(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentNullException(nameof(userId), "Tenant ID cannot be null or empty");
        _explicitTenantId = userId;
    }

    /// <summary>
    /// Clears the explicit tenant context. Only use for special admin/system operations that intentionally bypass tenant isolation.
    /// </summary>
    public void ClearTenantContext()
    {
        _explicitTenantId = null;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);

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
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Role).IsRequired();
            entity.HasIndex(u => u.NormalizedUserName).IsUnique(false);
        });

        // Set global query filters for multi-tenancy
        // These filters are automatically applied to all queries on these entities
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<SalesHistory>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<ReorderRequest>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<Order>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<Customer>().HasQueryFilter(e => e.UserId == CurrentUserId);
        modelBuilder.Entity<OrderItem>().HasQueryFilter(e => e.UserId == CurrentUserId);

        // SEED DATA
        var staticDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var adminId = "8e445865-a24d-4543-a6c6-9443d048cdb9";
        var userId = "3b333929-f974-444e-a8d3-68f50a356d51";

        var adminPasswordHash = "AQAAAAIAAYagAAAAEMXMR7yRo+DSLWhxE7Ps46cMsJAupwpX3z7sUyw+LW6J8Ugj6c/U5UHMgltwojS/EQ==";
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
        var hasTenantScopedChanges = false;

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
                    hasTenantScopedChanges = true;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    hasTenantScopedChanges = true;
                    break;
            }
        }

        // Validate tenant context is set before any tenant-scoped write operations
        // Allow writes to User table (registration) without tenant context
        if (hasTenantScopedChanges && string.IsNullOrEmpty(currentUserId))
        {
            throw new InvalidOperationException(
                "Cannot execute database operation without tenant context. " +
                "Ensure this is performed within an authenticated HTTP context, or call SetTenantContext() for background operations.");
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
