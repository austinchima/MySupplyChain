# Unidirectional Dependencies: Violation Examples

## What "Unidirectional Dependencies" Means

In your Clean Architecture, dependencies flow **one direction only**:

```
Domain ← Application ← Infrastructure
Domain ← Application ← API
```

**Domain is never allowed to reference anything above it.**
**Application is never allowed to reference Infrastructure directly.**

---

## ✅ CORRECT: The Current Pattern

### Example 1: Using Interfaces (Dependency Inversion)

**File: `MySupplyChain.Application/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs`**

```csharp
public class CreateOrderCommandHandler(
    IApplicationDbContext context,      // ← INTERFACE, not concrete class
    IDemandForecaster forecaster)       // ← INTERFACE, not concrete class
    : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Application layer uses interfaces, not concrete implementations
        var product = await context.Products.FindAsync([request.ProductId], cancellationToken);
        var forecast = await forecaster.PredictDemandAsync(product.Id, product.Sku, history);
        
        // Application doesn't know that IApplicationDbContext is implemented by
        // ApplicationDbContext in Infrastructure, or that IDemandForecaster is
        // implemented by DemandForecaster in Infrastructure.
        // This is the magic of Dependency Inversion.
    }
}
```

**Why this is correct:**
- Application depends on **abstractions** (interfaces)
- Infrastructure provides **implementations**
- Application has **zero knowledge** of Infrastructure details
- You can swap implementations without touching Application

---

## ❌ VIOLATIONS: What a Junior Dev Might Accidentally Write

### Violation #1: Directly Importing Infrastructure Class

**WRONG:**

```csharp
// ❌ BAD: Creating a direct reference from Application to Infrastructure
using MySupplyChain.Infrastructure.Persistence;  // This is the violation!

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, int>
{
    private readonly ApplicationDbContext _context;  // ← CONCRETE class, not interface!
    
    public CreateOrderCommandHandler()
    {
        // This creates a hard dependency on the Infrastructure layer
        _context = new ApplicationDbContext(...);  // ← Even worse, creating it manually
    }
    
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FindAsync([request.ProductId], cancellationToken);
        // ...
    }
}
```

**Why this is wrong:**
- Application **directly references** `ApplicationDbContext` from Infrastructure
- This violates **unidirectional dependencies**
- You cannot test Application without dragging in EF Core, migrations, the entire database
- You cannot swap the database implementation (e.g., switching from SQL Server to PostgreSQL) without recompiling Application
- **The dependency arrow points backward** (should be Application → Interface, but now it's Application → Infrastructure concrete class)

**Corrected version:**

```csharp
// ✅ CORRECT: Using the interface from Application.Common.Interfaces
using MySupplyChain.Application.Common.Interfaces;  // Interface is defined HERE

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler(
    IApplicationDbContext context)  // ← INTERFACE, not concrete class
    : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync([request.ProductId], cancellationToken);
        // Application knows nothing about ApplicationDbContext or EF Core
    }
}
```

---

### Violation #2: Calling Infrastructure Service Directly

**WRONG:**

```csharp
using MySupplyChain.Infrastructure.MachineLearning;  // ❌ Direct Infrastructure reference!

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // ...
        
        // ❌ BAD: Directly instantiating the Infrastructure implementation
        var forecaster = new DemandForecaster(modelPath, logger);
        var forecast = await forecaster.PredictDemandAsync(productId, sku, history);
        
        // This couples Application tightly to:
        // - The specific ML.NET implementation
        // - A specific model file path
        // - The constructor signature of DemandForecaster
        // - Cannot test without a real ML model file
    }
}
```

**Why this is wrong:**
- Application **directly creates** a concrete Infrastructure class
- You cannot test without the ML model file actually existing
- You cannot swap implementations (e.g., switching from ML.NET to TensorFlow)
- Changes to `DemandForecaster`'s constructor break Application code
- **The dependency arrow points backward**

**Corrected version:**

```csharp
// ✅ CORRECT: Using the interface injected via DI
using MySupplyChain.Application.Common.Interfaces;

public class CreateOrderCommandHandler(
    IDemandForecaster forecaster)  // ← Injected as interface
    : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // ...
        var forecast = await forecaster.PredictDemandAsync(productId, sku, history);
        
        // Application doesn't know or care that DemandForecaster exists
        // In tests, you can inject a mock IDemandForecaster
    }
}
```

---

### Violation #3: Application Referencing API Layer

**WRONG:**

```csharp
using MySupplyChain.API.Controllers;  // ❌ Application should NEVER reference API!

namespace MySupplyChain.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, int>
{
    public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // ...
        
        // ❌ BAD: Application calling back into API
        var controller = new OrdersController(...);
        await controller.GetOrder(orderId);
        
        // This is a circular dependency!
        // API depends on Application
        // Application now depends on API
        // This breaks the entire architecture
    }
}
```

**Why this is wrong:**
- **Circular dependency:** API → Application, but now Application → API
- Violates the entire purpose of layered architecture
- Creates infinite dependency chains
- Impossible to compile or reason about

**Correct approach:**
- Application only communicates with Domain
- API is the only layer that calls Application (via MediatR)
- Application never needs to know about HTTP controllers

---

### Violation #4: Domain Referencing Infrastructure

**WRONG:**

```csharp
using MySupplyChain.Infrastructure.Persistence;  // ❌ Domain should NEVER reference Infrastructure!

namespace MySupplyChain.Domain.Entities;

public class Product : EntityBase
{
    public string Name { get; set; }
    public string Sku { get; set; }
    public int CurrentStock { get; set; }
    
    // ❌ BAD: Domain entity depends on EF Core
    public virtual DbSet<SalesHistory> SalesHistory { get; set; }
    
    // ❌ BAD: Domain entity depends on a specific ORM feature
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
}
```

**Why this is wrong:**
- Domain is **polluted with Infrastructure details** (EF Core attributes, DbSet)
- Domain becomes **tightly coupled** to Entity Framework
- Cannot use the same Domain class with a different database (MongoDB, Cosmos DB, etc.)
- Domain should be **pure C# with zero dependencies** on external frameworks
- Testing Domain logic requires EF Core to be running

**Correct approach:**

```csharp
using MySupplyChain.Domain.Enums;

namespace MySupplyChain.Domain.Entities;

public class Product : EntityBase
{
    public string Name { get; set; }
    public string Sku { get; set; }
    public int CurrentStock { get; set; }
    public decimal Price { get; set; }
    public int ReorderPoint { get; set; }
    
    // ✅ CORRECT: Pure C# collections, no EF Core references
    public List<SalesHistory> SalesHistory { get; set; } = [];
    
    // ✅ CORRECT: Standard C# property, no database-specific attributes
    public int Id { get; set; }
}
```

Configuration is moved to **Infrastructure** (via Fluent API in ApplicationDbContext):

```csharp
// In MySupplyChain.Infrastructure/Persistence/ApplicationDbContext.cs
modelBuilder.Entity<Product>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
    entity.Property(e => e.Price).HasPrecision(18, 2);
});
```

---

## Summary Table

| Violation | Example | Impact | Fix |
|-----------|---------|--------|-----|
| **Referencing Infrastructure concrete class** | `new ApplicationDbContext(...)` in Application | Cannot test, cannot swap implementations | Use `IApplicationDbContext` interface |
| **Directly instantiating Infrastructure service** | `new DemandForecaster(...)` in Application | Tight coupling, impossible to mock in tests | Inject `IDemandForecaster` via DI |
| **Application → API reference** | Calling `OrdersController` from CommandHandler | Circular dependency, breaks architecture | Application only receives data from API (via MediatR) |
| **Domain → Infrastructure reference** | `DbSet<T>` or EF attributes in Entity classes | Domain is not portable, polluted with framework details | Keep Domain pure; move config to Infrastructure |
| **Domain → Application reference** | Importing a Command/Query in Domain entity | Inverts the dependency direction | Domain is innermost; nothing depends on it |

---

## The Golden Rule

**Innermost layers know NOTHING about outer layers.**

```
Domain:        Knows nothing. Pure business logic.
Application:   Knows only Domain. Defines interfaces for external services.
Infrastructure: Implements Application's interfaces. Knows about databases, APIs, etc.
API:           Orchestrates everything. The composition root.
```

If you ever find yourself writing `using` statements that point "backward" in this diagram, **stop and refactor**. That's a sign of a dependency violation.
