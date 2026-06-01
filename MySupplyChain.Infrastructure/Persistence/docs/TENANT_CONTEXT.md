# Tenant Context Management

## Overview

The `ApplicationDbContext` uses EF Core global query filters for multi-tenant data isolation. This document explains how to properly set and manage tenant context, especially in scenarios without HTTP context.

## How It Works

### In HTTP Requests (Automatic)

When handling HTTP requests, the tenant ID is automatically extracted from the authenticated user's claims:

```csharp
private string? CurrentUserId =>
    _explicitTenantId ?? httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

The global filters automatically apply `WHERE UserId == CurrentUserId` to all queries:

```csharp
// Your code:
var products = await dbContext.Products.ToListAsync();

// What EF Core executes:
var products = await dbContext.Products
    .Where(p => p.UserId == CurrentUserId)  // ← Filter applied automatically
    .ToListAsync();
```

**No action needed** — tenant isolation happens transparently.

### In Background Jobs (Explicit)

Background jobs and scheduled tasks run outside of HTTP context, so you must explicitly set the tenant context:

```csharp
public class ReorderNotificationJob
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<ReorderNotificationJob> _logger;

    public ReorderNotificationJob(ApplicationDbContext dbContext, ILogger<ReorderNotificationJob> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ExecuteAsync(string userId)
    {
        try
        {
            // Set tenant context BEFORE any database operations
            _dbContext.SetTenantContext(userId);

            // Now queries are properly scoped to this user
            var lowStockItems = await _dbContext.Products
                .Where(p => p.StockLevel < p.ReorderLevel)
                .ToListAsync();

            // Process notifications...
            foreach (var item in lowStockItems)
            {
                _logger.LogInformation("Creating reorder request for product {ProductId}", item.Id);
                // Create reorder request...
            }

            await _dbContext.SaveChangesAsync();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("tenant context"))
        {
            _logger.LogError("Background job failed: {Message}", ex.Message);
            throw;
        }
    }
}
```

## API Reference

### `SetTenantContext(string userId)`

Explicitly sets the tenant context for database operations.

**Parameters:**
- `userId` (string): The user ID to set as the tenant context

**Throws:**
- `ArgumentNullException`: If userId is null or empty

**Usage:**
```csharp
_dbContext.SetTenantContext(userId);
```

### `ClearTenantContext()`

Clears the explicit tenant context. **Use with caution** — this should only be used for special admin or system operations that intentionally need to bypass tenant isolation.

**Usage:**
```csharp
_dbContext.ClearTenantContext();
```

## Common Patterns

### Background Job with Dependency Injection

```csharp
public class DailyForecastingJob
{
    private readonly ApplicationDbContext _dbContext;

    public DailyForecastingJob(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task RunForAllUsersAsync(IEnumerable<string> userIds)
    {
        foreach (var userId in userIds)
        {
            // Set tenant context for each user
            _dbContext.SetTenantContext(userId);

            // All queries and saves are now scoped to this user
            var products = await _dbContext.Products.ToListAsync();
            // ... process forecasting ...

            await _dbContext.SaveChangesAsync();

            // Reset for next iteration (optional but clean)
            _dbContext.ClearTenantContext();
        }
    }
}
```

### Unit Testing

```csharp
[TestClass]
public class ProductServiceTests
{
    private ApplicationDbContext _dbContext;
    private const string TestUserId = "test-user-123";

    [TestInitialize]
    public void Setup()
    {
        // Create in-memory DbContext
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase("TestDb")
            .Options;

        _dbContext = new ApplicationDbContext(options, new MockHttpContextAccessor());
    }

    [TestMethod]
    public async Task GetProducts_ReturnsOnlyUserProducts()
    {
        // Arrange
        _dbContext.SetTenantContext(TestUserId);

        var product = new Product 
        { 
            Id = 1, 
            Name = "Test Product", 
            UserId = TestUserId 
        };
        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync();

        // Act
        var products = await _dbContext.Products.ToListAsync();

        // Assert
        Assert.AreEqual(1, products.Count);
        Assert.AreEqual(TestUserId, products[0].UserId);
    }
}
```

## Error Handling

If you forget to set the tenant context, you'll get a clear exception:

```
InvalidOperationException: Cannot execute database operation without tenant context. 
Ensure this is performed within an authenticated HTTP context, or call SetTenantContext() for background operations.
```

This is intentional — **loud failure is better than silent data leaks**.

## Security Considerations

1. **Always validate the user ID** before calling `SetTenantContext()`:
   ```csharp
   if (!await _userService.UserExistsAsync(userId))
       throw new InvalidOperationException("User not found");
   
   _dbContext.SetTenantContext(userId);
   ```

2. **Never pass untrusted user IDs** from request parameters directly:
   ```csharp
   // ❌ WRONG: User could request another user's data
   public async Task ProcessUserDataAsync(string userId)
   {
       _dbContext.SetTenantContext(userId);  // Dangerous!
   }

   // ✅ RIGHT: Only use authenticated user's ID
   public async Task ProcessMyDataAsync()
   {
       var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
       _dbContext.SetTenantContext(userId);
   }
   ```

3. **Use `ClearTenantContext()` sparingly** and only for documented admin operations:
   ```csharp
   // Only in admin-only endpoints
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> AdminViewAllProductsAsync()
   {
       _dbContext.ClearTenantContext();
       var allProducts = await _dbContext.Products.ToListAsync();
       return Ok(allProducts);
   }
   ```

## FAQ

**Q: What happens if CurrentUserId is null but I call SaveChangesAsync()?**

A: You'll get an `InvalidOperationException` with a clear message. This is intentional to prevent silent data corruption.

**Q: Can I reuse the same DbContext instance for multiple users?**

A: Yes, but you must call `SetTenantContext(newUserId)` before each user's operations. The tenant ID is stored per context instance.

**Q: Does `ClearTenantContext()` fall back to HTTP context?**

A: Yes. After clearing, the context reverts to reading the tenant ID from `HttpContext.User`. If that's also null, the next database operation will throw.

**Q: Should I set tenant context in every controller action?**

A: No — it's automatic from `HttpContext.User` in web requests. Only set it explicitly in background jobs and tests.
