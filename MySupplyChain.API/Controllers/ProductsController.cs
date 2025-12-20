using MediatR;
using Microsoft.AspNetCore.Mvc;
using MySupplyChain.Application.Products.Commands.CreateProduct;
using MySupplyChain.Application.Products.Queries.GetProductForecast;
using MySupplyChain.Application.Products.Commands.RestockProduct;
using MySupplyChain.Application.Products.Queries.GetAllProducts;

namespace MySupplyChain.API.Controllers;

/// <summary>
/// Thin API layer - delegates to MediatR handlers
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<int>> CreateProduct(CreateProductCommand command)
    {
        var productId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetProductForecast), new { id = productId }, productId);
    }

    /// <summary>
    /// Get AI-powered demand forecast for a product
    /// </summary>
    [HttpGet("{id}/forecast")]
    public async Task<ActionResult<ProductForecastDto>> GetProductForecast(int id, [FromQuery] int daysToForecast = 30)
    {
        var query = new GetProductForecastQuery 
        { 
            ProductId = id, 
            DaysToForecast = daysToForecast 
        };
        
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    /// <summary>
    /// Restock a product
    /// </summary>
    [HttpPost("{id}/restock")]
    public async Task<ActionResult<int>> Restock(int id, [FromBody] RestockProductCommand command)
    {
        if (id != command.ProductId)
        {
            return BadRequest("Product ID mismatch");
        }

        var newStockLevel = await _mediator.Send(command);
        return Ok(new { CurrentStock = newStockLevel, Message = "Product restocked successfully" });
    }

    /// <summary>
    /// Get all products with visibility into stock and health
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAllProducts()
    {
        var result = await _mediator.Send(new GetAllProductsQuery());
        return Ok(result);
    }
}
