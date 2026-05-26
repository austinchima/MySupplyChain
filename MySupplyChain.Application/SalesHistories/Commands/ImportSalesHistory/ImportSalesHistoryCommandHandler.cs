using CsvHelper;
using CsvHelper.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MySupplyChain.Application.Common.Exceptions;
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
            throw new MySupplyChain.Application.Common.Exceptions.ValidationException(new Dictionary<string, string[]> { { "File", ["CSV file has no headers."] } });

        var headers = csv.HeaderRecord.ToList();
        
        // Validate that requested columns exist
        var headerErrors = new Dictionary<string, string[]>();
        if (!headers.Contains(request.SkuColumn))
            headerErrors.Add("SkuColumn", [$"Column '{request.SkuColumn}' not found in CSV."]);
        if (!headers.Contains(request.DateColumn))
            headerErrors.Add("DateColumn", [$"Column '{request.DateColumn}' not found in CSV."]);
        if (!headers.Contains(request.QuantityColumn))
            headerErrors.Add("QuantityColumn", [$"Column '{request.QuantityColumn}' not found in CSV."]);

        if (headerErrors.Count > 0)
            throw new MySupplyChain.Application.Common.Exceptions.ValidationException(headerErrors);

        var newSales = new List<SalesHistory>();
        var newProductsBatch = new Dictionary<string, Product>();

        while (await csv.ReadAsync())
        {
            var sku = csv.GetField<string>(request.SkuColumn);
            if (string.IsNullOrWhiteSpace(sku)) continue;

            if (!productsCache.TryGetValue(sku, out var product))
            {
                if (!newProductsBatch.TryGetValue(sku, out product))
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
                    newProductsBatch[sku] = product;
                    summary.NewProductsCreated++;
                }
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
                Product = product, // Uses navigation property; EF handles the ID once saved
                Sku = sku,
                Date = date,
                QuantitySold = quantity,
                AdditionalData = additionalDataJson
            });
            summary.RecordsImported++;
        }

        if (newProductsBatch.Count > 0)
        {
            context.Products.AddRange(newProductsBatch.Values);
        }
        
        if (newSales.Count > 0)
        {
            context.SalesHistories.AddRange(newSales);
        }

        await context.SaveChangesAsync(cancellationToken);

        return summary;
    }
}
