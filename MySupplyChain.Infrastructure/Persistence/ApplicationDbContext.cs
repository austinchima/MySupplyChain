using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.Persistence;

/// <summary>
/// EF Core implementation of the database context
/// </summary>
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<SalesHistory> SalesHistories => Set<SalesHistory>();
    public DbSet<ReorderRequest> ReorderRequests => Set<ReorderRequest>();

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

    // Seed historical sales data
    var salesData = new List<SalesHistory>();
    var random = new Random(42);
    // Use a fixed date to ensure the model doesn't change on every build
    var startDate = new DateTime(2024, 1, 1); 

    for (int productId = 1; productId <= 3; productId++)
    {
        for (int day = 0; day < 90; day++)
        {
            salesData.Add(new SalesHistory
            {
                Id = (productId * 1000) + day,
                ProductId = productId,
                Date = startDate.AddDays(day),
                QuantitySold = random.Next(5, 20),  // Random sales 5-20 units
                CreatedAt = staticDate
            });
        }
    }

    modelBuilder.Entity<SalesHistory>().HasData(salesData);
    }
}
