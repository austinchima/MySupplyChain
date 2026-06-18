using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;

namespace MySupplyChain.Infrastructure.BackgroundServices;

public class EventIngestionChannel : IEventIngestionChannel
{
    private readonly Channel<SupplyChainEvent> _channel;

    public EventIngestionChannel()
    {
        var options = new BoundedChannelOptions(10_000)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _channel = Channel.CreateBounded<SupplyChainEvent>(options);
    }

    public async ValueTask PushEventAsync(SupplyChainEvent supplyChainEvent, CancellationToken cancellationToken = default)
    {
        await _channel.Writer.WriteAsync(supplyChainEvent, cancellationToken);
    }

    public IAsyncEnumerable<SupplyChainEvent> ReadAllAsync(CancellationToken cancellationToken = default)
    {
        return _channel.Reader.ReadAllAsync(cancellationToken);
    }
}
