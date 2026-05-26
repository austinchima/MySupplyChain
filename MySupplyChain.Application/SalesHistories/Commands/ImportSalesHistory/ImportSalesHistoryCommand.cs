using MediatR;

namespace MySupplyChain.Application.SalesHistories.Commands.ImportSalesHistory;

public class ImportSalesHistoryCommand : IRequest<ImportSummaryDto>
{
    public byte[] FileContent { get; set; } = [];
    public string SkuColumn { get; set; } = string.Empty;
    public string DateColumn { get; set; } = string.Empty;
    public string QuantityColumn { get; set; } = string.Empty;
}
