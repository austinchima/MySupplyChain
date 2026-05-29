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
        
        // Harden cache against duplicate SKUs in DB
        // We fetch the list first to avoid untranslatable GroupBy issues in EF Core
        var productsList = await context.Products
            .Where(p => p.Sku != "")
            .ToListAsync(cancellationToken);

        var productsCache = productsList
            .GroupBy(p => p.Sku)
            .ToDictionary(g => g.Key, g => g.First());

        // Cache customers by email to avoid duplicates
        var customersList = await context.Customers
            .Where(c => c.Email != "")
            .ToListAsync(cancellationToken);

        var customersCache = customersList
            .GroupBy(c => c.Email.ToLower())
            .ToDictionary(g => g.Key, g => g.First());
        
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
        
        // Validate that primary requested columns exist
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
        var newCustomersBatch = new Dictionary<string, Customer>();
        var newOrdersBatch = new Dictionary<string, Order>();

        while (await csv.ReadAsync())
        {
            // --- 1. PRODUCT PROCESSING ---
            var sku = csv.GetField<string>(request.SkuColumn)?.Trim();
            if (string.IsNullOrWhiteSpace(sku)) continue;

            if (!productsCache.TryGetValue(sku, out var product))
            {
                if (!newProductsBatch.TryGetValue(sku, out product))
                {
                    // Auto-create product with advanced mapping
                    var name = !string.IsNullOrEmpty(request.ProductNameColumn) && headers.Contains(request.ProductNameColumn)
                        ? csv.GetField<string>(request.ProductNameColumn)?.Trim()
                        : $"Imported Product ({sku})";

                    decimal price = 0m;
                    if (!string.IsNullOrEmpty(request.ProductPriceColumn) && headers.Contains(request.ProductPriceColumn))
                    {
                        var priceStr = csv.GetField<string>(request.ProductPriceColumn);
                        if (!decimal.TryParse(priceStr, out price))
                        {
                            price = 0m;
                        }
                    }

                    product = new Product
                    {
                        Sku = sku,
                        Name = string.IsNullOrEmpty(name) ? $"Imported Product ({sku})" : name,
                        Price = Math.Abs(price), // Feature engineering: price cannot be negative
                        CurrentStock = 100, // Default starting stock
                        ReorderPoint = 20,
                        CreatedAt = DateTime.UtcNow
                    };
                    newProductsBatch[sku] = product;
                    summary.NewProductsCreated++;
                }
            }

            // --- 2. CUSTOMER PROCESSING ---
            Customer? customer = null;
            if (!string.IsNullOrEmpty(request.CustomerEmailColumn) && headers.Contains(request.CustomerEmailColumn))
            {
                var email = csv.GetField<string>(request.CustomerEmailColumn)?.Trim().ToLower();
                if (!string.IsNullOrEmpty(email))
                {
                    if (!customersCache.TryGetValue(email, out customer))
                    {
                        if (!newCustomersBatch.TryGetValue(email, out customer))
                        {
                            var cName = !string.IsNullOrEmpty(request.CustomerNameColumn) && headers.Contains(request.CustomerNameColumn)
                                ? csv.GetField<string>(request.CustomerNameColumn)?.Trim()
                                : "Imported Customer";

                            customer = new Customer
                            {
                                Name = string.IsNullOrEmpty(cName) ? "Imported Customer" : cName,
                                Email = email,
                                Company = "Retail Customer",
                                CreatedAt = DateTime.UtcNow
                            };
                            newCustomersBatch[email] = customer;
                        }
                    }
                }
            }

            // --- 3. DATE & QUANTITY PROCESSING ---
            var dateStr = csv.GetField<string>(request.DateColumn);
            if (!DateTime.TryParse(dateStr, out var date))
            {
                date = DateTime.UtcNow;
            }
            else
            {
                date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            }

            var quantityStr = csv.GetField<string>(request.QuantityColumn);
            if (!int.TryParse(quantityStr, out var quantity))
            {
                quantity = 0;
            }
            quantity = Math.Max(0, quantity); // Feature engineering: Handle negative quantities

            // --- 4. ORDER GROUPING ---
            if (!string.IsNullOrEmpty(request.OrderIdColumn) && headers.Contains(request.OrderIdColumn))
            {
                var orderNo = csv.GetField<string>(request.OrderIdColumn)?.Trim();
                if (!string.IsNullOrEmpty(orderNo))
                {
                    if (!newOrdersBatch.TryGetValue(orderNo, out _))
                    {
                        newOrdersBatch[orderNo] = new Order
                        {
                            OrderNumber = orderNo,
                            Customer = customer,
                            OrderDate = date,
                            Status = Domain.Enums.OrderStatus.Delivered,
                            CreatedAt = DateTime.UtcNow
                        };
                    }
                }
            }

            // --- 5. SALES HISTORY RECORDING ---
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
                Product = product,
                Sku = sku,
                Date = date,
                QuantitySold = quantity,
                AdditionalData = additionalDataJson,
                CreatedAt = DateTime.UtcNow
            });
            summary.RecordsImported++;
        }

        if (newProductsBatch.Count > 0) context.Products.AddRange(newProductsBatch.Values);
        if (newCustomersBatch.Count > 0) context.Customers.AddRange(newCustomersBatch.Values);
        if (newOrdersBatch.Count > 0) context.Orders.AddRange(newOrdersBatch.Values);
        if (newSales.Count > 0) context.SalesHistories.AddRange(newSales);

        await context.SaveChangesAsync(cancellationToken);
        return summary;
    }
}
