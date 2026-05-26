using MediatR;

namespace MySupplyChain.Application.SalesHistories.Commands.ImportSalesHistory;

public class ImportSalesHistoryCommand : IRequest<ImportSummaryDto>
{
    public byte[] FileContent { get; set; } = [];
    public string SkuColumn { get; set; } = string.Empty;
    public string DateColumn { get; set; } = string.Empty;
    public string QuantityColumn { get; set; } = string.Empty;

    // Optional advanced mappings
    public string? ProductNameColumn { get; set; }
    public string? ProductPriceColumn { get; set; }
    public string? CustomerNameColumn { get; set; }
    public string? CustomerEmailColumn { get; set; }
    public string? OrderIdColumn { get; set; }
}
