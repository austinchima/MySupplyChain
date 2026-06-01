# Security and Tenant Context Issues Found

## Critical Issues

### 1. ❌ HealthController accessing DbContext without authentication
**File**: `MySupplyChain/MySupplyChain.API/Controllers/HealthController.cs`

**Problem**: 
```csharp
public class HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
```
The controller injects `ApplicationDbContext` directly for database connectivity checks. If database seeding or initialization requires user context, it will fail. However, the current implementation only calls `context.Database.CanConnectAsync()` which doesn't execute queries, so it's not immediately critical but could be a source of confusion.

**Risk Level**: Medium (not immediately exploitable, but poor design)

**Fix**: Use `IApplicationDbContext` interface instead, or inject a service that handles DB checks.

---

### 2. ❌ Database Migration in Program.cs has no tenant context
**File**: `MySupplyChain/MySupplyChain.API/Program.cs` (Lines 159-165)

**Problem**:
```csharp
var context = services.GetRequiredService<MySupplyChain.Infrastructure.Persistence.ApplicationDbContext>();
await context.Database.MigrateAsync();
```

Database migrations run during application startup. With our new validation, if any migration or seed data triggers a SaveChangesAsync on tenant-scoped entities, it will throw because there's no tenant context set.

**Risk Level**: Critical during deployment

**Current Status**: Safe because:
- Migrations only create schema (not tenant data)
- Seed data in OnModelCreating uses `HasData()` which bypasses SaveChangesAsync
- But if you add seeded tenant data later, this will break

---

### 3. ❌ WipeUserDataCommand needs tenant validation
**File**: `MySupplyChain/MySupplyChain.Application/Auth/Commands/WipeUserData/WipeUserDataCommand.cs`

**Problem**:
```csharp
public class WipeUserDataCommandHandler(IApplicationDbContext context) : IRequestHandler<WipeUserDataCommand>
{
    public async Task Handle(WipeUserDataCommand request, CancellationToken cancellationToken)
    {
        // No validation that this is the authenticated user's data
        context.SalesHistories.RemoveRange(context.SalesHistories);
        context.Orders.RemoveRange(context.Orders);
        context.Products.RemoveRange(context.Products);
        // ...
        await context.SaveChangesAsync(cancellationToken);
    }
}
```

**Risk**:
- No explicit check that the authenticated user is attempting to wipe their own data
- Relies entirely on global filters (which is correct, but should be explicit)
- No logging of sensitive operation

**Risk Level**: Medium (filters protect, but bad practice to not log)

---

### 4. ❌ DeleteAccountCommand has no audit trail
**File**: `MySupplyChain/MySupplyChain.Application/Auth/Commands/DeleteAccount/DeleteAccountCommand.cs`

**Problem**:
```csharp
public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
{
    // 1. Wipe business data (no logging)
    context.SalesHistories.RemoveRange(context.SalesHistories);
    // ...
    await context.SaveChangesAsync(cancellationToken);

    // 2. Delete the user account (no logging, no verification)
    await authService.DeleteAccountAsync(request.UserId);
}
```

**Risks**:
- Destructive operation (delete account) has no audit log
- No verification that the deleting user is the account owner
- Command accepts any `userId` — should only allow current authenticated user

**Risk Level**: High (data loss without audit, potential abuse)

---

### 5. ⚠️ HealthController database check is public
**File**: `MySupplyChain/MySupplyChain.API/Controllers/HealthController.cs`

**Problem**:
```csharp
[HttpGet("detailed")]
public async Task<IActionResult> GetDetailed()
{
    // No authorization check
    // Returns: database status, ML model status
```

**Risk**:
- Any unauthenticated user can check if database is up
- Reveals infrastructure info (database status, model file existence)
- Not critical but violates least-privilege

**Risk Level**: Low (informational leakage)

---

## Recommended Fixes

### Fix 1: Add Audit Logging to Destructive Operations

Create an `IAuditLog` service and use it in:
- `DeleteAccountCommand` — log user deletion with timestamp
- `WipeUserDataCommand` — log data wipe event
- Any operation that modifies/deletes significant data

### Fix 2: Validate User Authorization in Delete Commands

```csharp
public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
{
    var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
    // ✅ Add validation
    if (currentUserId != request.UserId)
        throw new UnauthorizedAccessException("Cannot delete another user's account");
    
    // Proceed...
}
```

### Fix 3: Secure HealthController

```csharp
[HttpGet("detailed")]
[Authorize]  // ← Add this
public async Task<IActionResult> GetDetailed()
{
    // Now only authenticated users can see infrastructure details
}
```

### Fix 4: Add Tenant Context to Database Initialization

If you add tenant-scoped seed data in the future, modify Program.cs:

```csharp
var context = services.GetRequiredService<ApplicationDbContext>();
await context.Database.MigrateAsync();

// If you add tenant-scoped seeding:
// context.SetTenantContext("system-seeder-id");
// await context.SaveChangesAsync();
```

### Fix 5: Add Logging to SaveChangesAsync

```csharp
public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
{
    var currentUserId = CurrentUserId;

    if (string.IsNullOrEmpty(currentUserId))
    {
        throw new InvalidOperationException(
            "Cannot execute database operation without tenant context...");
    }

    // ✅ Add logging for sensitive operations
    var deletedCount = ChangeTracker.Entries()
        .Where(e => e.State == EntityState.Deleted)
        .Count();
    
    if (deletedCount > 0)
    {
        // Log the deletion
        _logger?.LogWarning("User {UserId} is deleting {Count} entities", currentUserId, deletedCount);
    }

    // ... rest of method
}
```

---

## Summary Table

| Issue | File | Severity | Fix |
|-------|------|----------|-----|
| Missing auth on GetDetailed | HealthController | Low | Add `[Authorize]` |
| No audit logging on delete | DeleteAccountCommand | High | Add `IAuditLog` service |
| No user validation on delete | DeleteAccountCommand | High | Validate `userId` == current user |
| No logging on wipe | WipeUserDataCommand | Medium | Add logging |
| Potential future migration issue | Program.cs | Medium | Document SetTenantContext for seeding |
| Direct DbContext injection | HealthController | Medium | Use interface or service |

---

## Next Steps

1. **Immediate** (before using SetTenantContext in production):
   - Add `[Authorize]` to HealthController.GetDetailed()
   - Add user validation to DeleteAccountCommand

2. **Short-term** (next iteration):
   - Implement IAuditLog service for sensitive operations
   - Add logging to SaveChangesAsync for deletions

3. **Documentation**:
   - Document that SetTenantContext must be called for any seeding with tenant-scoped data
   - Add security notes to TENANT_CONTEXT.md

4. **Testing**:
   - Add tests to verify users cannot delete other users' accounts
   - Add tests to verify HealthController.GetDetailed requires auth
