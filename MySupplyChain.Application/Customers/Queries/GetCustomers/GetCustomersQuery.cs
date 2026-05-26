using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;

namespace MySupplyChain.Application.Customers.Queries.GetCustomers;

public record GetCustomersQuery : IRequest<IEnumerable<CustomerDto>>;

public class GetCustomersQueryHandler(IApplicationDbContext context) : IRequestHandler<GetCustomersQuery, IEnumerable<CustomerDto>>
{
    public async Task<IEnumerable<CustomerDto>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        return await context.Customers
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Company = c.Company,
                Email = c.Email
            })
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }
}
