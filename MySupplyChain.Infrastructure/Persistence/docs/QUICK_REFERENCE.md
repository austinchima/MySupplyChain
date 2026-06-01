# Quick Reference: Tenant Context

## TL;DR

```csharp
// ✅ In web requests: automatic, nothing to do
var products = await dbContext.Products.ToListAsync();

// ✅ In background jobs: must set tenant context first
dbContext.SetTenantContext(userId);
var products = await dbContext.Products.ToListAsync();

// ✅ For admin operations: explicitly clear isolation
dbContext.ClearTenantContext();
var allProducts = await dbContext.Products.IgnoreQueryFilters().ToListAsync();
```

## The Problem We Solved

**Before:**
```csharp
// Null tenant ID silently returns empty results
var products = await dbContext.Products.ToListAsync();  // Returns nothing, no error
```

**After:**
```csharp
// Null tenant ID throws with helpful message
var products = await dbContext.Products.ToListAsync();  
// Throws: "Cannot execute database operation without tenant context."
```

## Checklist for Your Code

- [ ] **Web Controllers**: No changes needed (automatic)
- [ ] **Background Jobs**: Add `dbContext.SetTenantContext(userId)` before DB operations
- [ ] **Unit Tests**: Add `dbContext.SetTenantContext(testUserId)` in test setup
- [ ] **Admin Features**: Document use of `ClearTenantContext()`

## Example: Background Job

```csharp
public async Task ProcessReordersAsync(string userId)
{
    // 1. Set tenant context FIRST
    _dbContext.SetTenantContext(userId);
    
    try
    {
        // 2. Now all operations are scoped to this user
        var orders = await _dbContext.Orders.ToListAsync();
        
        foreach (var order in orders)
        {
            // Process...
        }
        
        // 3. Save changes
        await _dbContext.SaveChangesAsync();
    }
    catch (InvalidOperationException ex)
    {
        _logger.LogError("Tenant context error: {Message}", ex.Message);
        throw;
    }
}
```

## Error Message Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `"Cannot execute database operation without tenant context"` | No SetTenantContext() in background job | Call `SetTenantContext(userId)` |
| `"Tenant ID cannot be null or empty"` | Passed empty string to SetTenantContext() | Validate userId before calling |
| Empty result set (no error) | Calling in HTTP context but user not authenticated | Check HttpContext.User.Identity.IsAuthenticated |

## API

```csharp
// Set explicit tenant context
public void SetTenantContext(string userId)
    // Throws: ArgumentNullException if userId is null/empty

// Clear explicit tenant context  
public void ClearTenantContext()
    // Reverts to HttpContext.User, throws if null

// Internal use (readonly, no direct access)
private string? CurrentUserId { get; }
```

## Don't Forget!

```csharp
// ❌ WRONG: Missing SetTenantContext() in background job
public async Task DailyJobAsync(string userId)
{
    var products = await _dbContext.Products.ToListAsync();  // Throws!
}

// ✅ RIGHT: Set tenant context first
public async Task DailyJobAsync(string userId)
{
    _dbContext.SetTenantContext(userId);
    var products = await _dbContext.Products.ToListAsync();  // Works!
}
```

## Questions?

See `TENANT_CONTEXT.md` for detailed documentation.
