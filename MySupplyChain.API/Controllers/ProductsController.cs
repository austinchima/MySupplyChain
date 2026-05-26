using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Products.Commands.CreateProduct;
using MySupplyChain.Application.Products.Commands.RestockProduct;
using MySupplyChain.Application.Products.Queries.GetAllProducts;
using MySupplyChain.Application.Products.Queries.GetProductForecast;

namespace MySupplyChain.API.Controllers;

/// <summary>
/// Thin API layer - delegates to MediatR handlers
/// </summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProductsController(IMediator mediator, ILogger<ProductsController> logger) : ControllerBase
{
    /// <summary>
    /// Create a new product
    /// </summary>
    /// <remarks>
    /// Adds a new product to the catalog.
    /// </remarks>
    /// <param name="command">Product creation details.</param>
    /// <returns>The ID of the newly created product.</returns>
    /// <response code="201">Product created successfully</response>
    /// <response code="400">Invalid product details</response>
    [HttpPost]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<int>> CreateProduct(CreateProductCommand command)
    {
        logger.LogInformation("CreateProduct called for {Name}", command.Name);
        var productId = await mediator.Send(command);
        return CreatedAtAction(nameof(GetProductForecast), new { id = productId }, productId);
    }

    /// <summary>
    /// Get AI-powered demand forecast for a product
    /// </summary>
    /// <remarks>
    /// Uses historical sales data and an ML.NET model to forecast future demand.
    /// </remarks>
    /// <param name="id">The product ID.</param>
    /// <param name="daysToForecast">Number of days to forecast (default 30).</param>
    /// <returns>Forecasted sales data.</returns>
    /// <response code="200">Forecast generated successfully</response>
    /// <response code="404">Product not found</response>
    [HttpGet("{id}/forecast")]
    [ProducesResponseType(typeof(ProductForecastDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductForecastDto>> GetProductForecast(int id, [FromQuery] int daysToForecast = 30)
    {
        logger.LogInformation("GetProductForecast called for ProductId={ProductId}, Days={Days}", id, daysToForecast);
        var query = new GetProductForecastQuery
        {
            ProductId = id,
            DaysToForecast = daysToForecast
        };

        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Restock a product
    /// </summary>
    /// <remarks>
    /// Manually adds stock to a product.
    /// </remarks>
    /// <param name="id">The product ID.</param>
    /// <param name="command">Restock details including quantity.</param>
    /// <returns>The updated stock level.</returns>
    /// <response code="200">Stock updated successfully</response>
    /// <response code="400">Invalid request (e.g. ID mismatch)</response>
    /// <response code="404">Product not found</response>
    [HttpPost("{id}/restock")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<int>> Restock(int id, [FromBody] RestockProductCommand command)
    {
        if (id != command.ProductId)
        {
            logger.LogWarning("Restock called with mismatched ProductId. RouteId={RouteId}, BodyId={BodyId}", id,
                command.ProductId);
            return BadRequest("Product ID mismatch");
        }

        logger.LogInformation("Restock called for ProductId={ProductId}, Quantity={Quantity}", id, command.Quantity);
        var newStockLevel = await mediator.Send(command);
        return Ok(new { CurrentStock = newStockLevel, Message = "Product restocked successfully" });
    }

    /// <summary>
    /// Get all products with visibility into stock and health
    /// </summary>
    /// <returns>A list of all products.</returns>
    /// <response code="200">List of products retrieved successfully</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductDto>>> GetAllProducts()
    {
        logger.LogInformation("GetAllProducts called");
        var result = await mediator.Send(new GetAllProductsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Update a product (e.g. adjust reorder point)
    /// </summary>
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        await mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        await mediator.Send(new DeleteProductCommand(id));
        return NoContent();
    }
}
