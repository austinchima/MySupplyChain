using MediatR;

namespace MySupplyChain.Application.Products.Queries.GetAllProducts;

public class GetAllProductsQuery : IRequest<List<ProductDto>>;
