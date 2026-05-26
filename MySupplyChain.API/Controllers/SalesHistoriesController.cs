using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.SalesHistories.Commands.ImportSalesHistory;

namespace MySupplyChain.API.Controllers;

public class ImportCsvRequest
{
    public IFormFile File { get; set; } = null!;
    public string SkuColumn { get; set; } = string.Empty;
    public string DateColumn { get; set; } = string.Empty;
    public string QuantityColumn { get; set; } = string.Empty;

    public string? ProductNameColumn { get; set; }
    public string? ProductPriceColumn { get; set; }
    public string? CustomerNameColumn { get; set; }
    public string? CustomerEmailColumn { get; set; }
    public string? OrderIdColumn { get; set; }
}

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SalesHistoriesController(IMediator mediator, ILogger<SalesHistoriesController> logger) : ControllerBase
{
    [HttpPost("import")]
    [ProducesResponseType(typeof(ImportSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImportSummaryDto>> Import([FromForm] ImportCsvRequest request)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        logger.LogInformation("Importing CSV: {FileName}, size: {Size}", request.File.FileName, request.File.Length);

        using var memoryStream = new MemoryStream();
        await request.File.CopyToAsync(memoryStream);

        var command = new ImportSalesHistoryCommand
        {
            FileContent = memoryStream.ToArray(),
            SkuColumn = request.SkuColumn,
            DateColumn = request.DateColumn,
            QuantityColumn = request.QuantityColumn,
            ProductNameColumn = request.ProductNameColumn,
            ProductPriceColumn = request.ProductPriceColumn,
            CustomerNameColumn = request.CustomerNameColumn,
            CustomerEmailColumn = request.CustomerEmailColumn,
            OrderIdColumn = request.OrderIdColumn
        };

        var summary = await mediator.Send(command);
        return Ok(summary);
    }
}
