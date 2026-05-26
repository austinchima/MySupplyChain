using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.SalesHistories.Commands.ImportSalesHistory;

namespace MySupplyChain.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SalesHistoriesController(IMediator mediator, ILogger<SalesHistoriesController> logger) : ControllerBase
{
    [HttpPost("import")]
    [ProducesResponseType(typeof(ImportSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImportSummaryDto>> Import(
        [FromForm] IFormFile file, 
        [FromForm] string skuColumn, 
        [FromForm] string dateColumn, 
        [FromForm] string quantityColumn)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        logger.LogInformation("Importing CSV: {FileName}, size: {Size}", file.FileName, file.Length);

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);

        var command = new ImportSalesHistoryCommand
        {
            FileContent = memoryStream.ToArray(),
            SkuColumn = skuColumn,
            DateColumn = dateColumn,
            QuantityColumn = quantityColumn
        };

        var summary = await mediator.Send(command);
        return Ok(summary);
    }
}
