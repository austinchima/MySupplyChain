using System.Threading;
using System.Threading.Tasks;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Application.Common.Interfaces;

public interface IEventIngestionChannel
{
    ValueTask PushEventAsync(SupplyChainEvent supplyChainEvent, CancellationToken cancellationToken = default);
}
