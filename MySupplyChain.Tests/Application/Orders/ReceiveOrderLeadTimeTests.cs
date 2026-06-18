using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Orders.Commands.UpdateOrder;
using MySupplyChain.Domain.Entities;
using MySupplyChain.Domain.Enums;
using MySupplyChain.Infrastructure.Persistence;

namespace MySupplyChain.Tests.Application.Orders;

/// <summary>
/// Tests for supplier lead-time tracking when an order is marked as received (Delivered).
///
/// NOTE: The calculation of ActualLeadTimeDays inside UpdateOrderCommandHandler is a TODO
/// for the developer to implement. This test defines the CONTRACT that handler must satisfy.
/// </summary>
public class ReceiveOrderLeadTimeTests
{
    private readonly ApplicationDbContext _context;
    private readonly UpdateOrderCommandHandler _handler;

    public ReceiveOrderLeadTimeTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _context = new ApplicationDbContext(options, httpContextAccessorMock.Object);

        // Use same tenant-context pattern as existing handler tests
        _context.SetTenantContext("test-user-id");

        _handler = new UpdateOrderCommandHandler(_context);
    }

    /// <summary>
    /// CONTRACT: When an order is transitioned to Delivered (received),
    /// the handler MUST write ActualLeadTimeDays = (ReceivedDate - OrderDate).Days.
    ///
    /// The developer must implement:
    ///   1. Set order.ReceivedDate = DateTime.UtcNow  when Status == Delivered
    ///   2. Set order.ActualLeadTimeDays = (ReceivedDate - OrderDate).Days
    /// in UpdateOrderCommandHandler.Handle().
    ///
    /// This test will FAIL until that logic is added (red-green TDD).
    /// </summary>
    [Fact]
    public async Task WhenOrderIsReceived_ThenActualLeadTimeIsCalculated()
    {
        // ── Arrange ────────────────────────────────────────────────────────────
        // Place an order dated 8 days ago so ActualLeadTimeDays should be 8
        var orderDate = DateTime.UtcNow.AddDays(-8);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Test Supplier",
            Email = "test@supplier.com",
            PromisedLeadTimeDays = 7,
            IsActive = true
        };
        _context.Suppliers.Add(supplier);

        var order = new Order
        {
            OrderNumber = "ORD-LEAD-001",
            OrderDate = orderDate,
            Status = OrderStatus.Shipped,
            TotalAmount = 500m,
            SupplierId = supplier.Id
        };
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var command = new UpdateOrderCommand(order.Id, OrderStatus.Delivered);

        // ── Act ────────────────────────────────────────────────────────────────
        await _handler.Handle(command, CancellationToken.None);

        // ── Assert ─────────────────────────────────────────────────────────────
        var updatedOrder = await _context.Orders
            .IgnoreQueryFilters()          // bypass tenant filter — not needed in unit test
            .FirstAsync(o => o.Id == order.Id);

        // Status must be Delivered
        updatedOrder.Status.Should().Be(OrderStatus.Delivered);

        // ReceivedDate must be set (within the last minute — handler sets it to UtcNow)
        updatedOrder.ReceivedDate.Should().NotBeNull(
            "handler must set ReceivedDate when status transitions to Delivered");
        updatedOrder.ReceivedDate!.Value.Should()
            .BeCloseTo(DateTime.UtcNow, precision: TimeSpan.FromSeconds(60));

        // ActualLeadTimeDays = (ReceivedDate - OrderDate).Days ≈ 8
        // We allow ±1 day tolerance for wall-clock drift during the test run
        updatedOrder.ActualLeadTimeDays.Should().NotBeNull(
            "handler must calculate and save ActualLeadTimeDays when Status == Delivered");
        updatedOrder.ActualLeadTimeDays!.Value.Should()
            .BeInRange(7, 9,
            "ActualLeadTimeDays must equal (ReceivedDate - OrderDate).Days, which is approximately 8");
    }

    /// <summary>
    /// Guard test: When an order is NOT transitioned to Delivered,
    /// ActualLeadTimeDays and ReceivedDate should remain null.
    /// This ensures the calculation only fires on the Delivered transition.
    /// </summary>
    [Fact]
    public async Task WhenOrderIsNotReceived_ThenActualLeadTimeRemainsNull()
    {
        // ── Arrange ────────────────────────────────────────────────────────────
        var order = new Order
        {
            OrderNumber = "ORD-LEAD-002",
            OrderDate = DateTime.UtcNow.AddDays(-3),
            Status = OrderStatus.Shipped,
            TotalAmount = 250m
        };
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Update to a non-terminal status
        var command = new UpdateOrderCommand(order.Id, OrderStatus.Processing);

        // ── Act ────────────────────────────────────────────────────────────────
        await _handler.Handle(command, CancellationToken.None);

        // ── Assert ─────────────────────────────────────────────────────────────
        var updatedOrder = await _context.Orders
            .IgnoreQueryFilters()
            .FirstAsync(o => o.Id == order.Id);

        updatedOrder.Status.Should().Be(OrderStatus.Processing);
        updatedOrder.ActualLeadTimeDays.Should().BeNull(
            "ActualLeadTimeDays must only be set when the order is received (Delivered)");
        updatedOrder.ReceivedDate.Should().BeNull(
            "ReceivedDate must only be set when the order is received (Delivered)");
    }
}
