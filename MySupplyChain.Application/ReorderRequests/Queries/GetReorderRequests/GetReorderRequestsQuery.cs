using MediatR;

namespace MySupplyChain.Application.ReorderRequests.Queries.GetReorderRequests;

public class GetReorderRequestsQuery : IRequest<List<ReorderRequestDto>>;
