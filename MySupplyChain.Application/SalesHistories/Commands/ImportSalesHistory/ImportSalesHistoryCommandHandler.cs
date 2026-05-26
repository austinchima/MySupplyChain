using CsvHelper;
using CsvHelper.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Interfaces;
using MySupplyChain.Domain.Entities;
using System.Globalization;
using System.Text.Json;

namespace MySupplyChain.Application.SalesHistories.Commands.ImportSalesHistory;

public class ImportSalesHistoryCommandHandler(IApplicationDbContext context) : IRequestHandler<ImportSalesHistoryCommand, ImportSummaryDto>
{
    public async Task<ImportSummaryDto> Handle(ImportSalesHistoryCommand request, CancellationToken cancellationToken)
    {
        var summary = new ImportSummaryDto();
        var productsCache = await context.Products.ToDictionaryAsync(p => p.Sku, cancellationToken);
        
        using var memoryStream = new MemoryStream(request.FileContent);
        using var reader = new StreamReader(memoryStream);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null,
            HeaderValidated = null
        };
        using var csv = new CsvReader(reader, config);

        await csv.ReadAsync();
        csv.ReadHeader();
        
        if (csv.HeaderRecord == null)
            throw new Exception("CSV file has no headers.");

        var headers = csv.HeaderRecord.ToList();
        
        var newSales = new List<SalesHistory>();
        var newProducts = new List<Product>();

        while (await csv.ReadAsync())
        {
            var sku = csv.GetField<string>(request.SkuColumn);
            if (string.IsNullOrWhiteSpace(sku)) continue;

            if (!productsCache.TryGetValue(sku, out var product))
            {
                // Auto-create product
                product = new Product
                {
                    Sku = sku,
                    Name = $"Imported Product ({sku})",
                    Price = 0m,
                    CurrentStock = 0,
                    ReorderPoint = 10
                };
                newProducts.Add(product);
                productsCache[sku] = product;
                summary.NewProductsCreated++;
            }

            var dateStr = csv.GetField<string>(request.DateColumn);
            if (!DateTime.TryParse(dateStr, out var date))
            {
                date = DateTime.UtcNow; // Fallback
            }

            var quantityStr = csv.GetField<string>(request.QuantityColumn);
            if (!int.TryParse(quantityStr, out var quantity))
            {
                quantity = 0;
            }

            // Capture additional data
            var additionalDataDict = new Dictionary<string, string?>();
            foreach (var header in headers)
            {
                if (header != request.SkuColumn && header != request.DateColumn && header != request.QuantityColumn)
                {
                    additionalDataDict[header] = csv.GetField<string>(header);
                }
            }
            
            var additionalDataJson = additionalDataDict.Count > 0 ? JsonSerializer.Serialize(additionalDataDict) : null;

            newSales.Add(new SalesHistory
            {
                Product = product, // Uses navigation property to tie to existing or newly created product
                ProductId = product.Id, // Will be 0 for new products until saved, EF handles this
                Sku = sku,
                Date = date,
                QuantitySold = quantity,
                AdditionalData = additionalDataJson
            });
            summary.RecordsImported++;
        }

        if (newProducts.Count > 0)
        {
            context.Products.AddRange(newProducts);
        }
        
        if (newSales.Count > 0)
        {
            context.SalesHistories.AddRange(newSales);
        }

        await context.SaveChangesAsync(cancellationToken);

        return summary;
    }
}
