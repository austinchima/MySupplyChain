using Microsoft.EntityFrameworkCore;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Application.Common.Interfaces;

/// <summary>
/// Interface for database operations - to be implemented by EF Core in Infrastructure
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<SalesHistory> SalesHistories { get; }
    DbSet<ReorderRequest> ReorderRequests { get; }
    DbSet<Order> Orders { get; }
    DbSet<Customer> Customers { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
