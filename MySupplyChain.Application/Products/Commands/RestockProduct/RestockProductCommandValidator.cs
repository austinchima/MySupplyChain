using FluentValidation;

namespace MySupplyChain.Application.Products.Commands.RestockProduct;

/// <summary>
/// Validator for RestockProductCommand
/// </summary>
public class RestockProductCommandValidator : AbstractValidator<RestockProductCommand>
{
    public RestockProductCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("Product ID must be greater than 0");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");
    }
}
