namespace MySupplyChain.Domain.Enums;

public enum OrderStatus
{
    Pending = 0,
    Processing = 1,
    ReadyToShip = 2,
    Shipped = 3,
    DeliveryFailed = 4,
    Delivered = 5,
    Cancelled = 6
}
