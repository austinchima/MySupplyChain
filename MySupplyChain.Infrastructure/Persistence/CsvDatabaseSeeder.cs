using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MySupplyChain.Domain.Entities;
using MySupplyChain.Domain.Enums;

namespace MySupplyChain.Infrastructure.Persistence;

public class RetailSalesRecord
{
    [Name("Order ID")]
    public string OrderId { get; set; } = string.Empty;

    [Name("Order Date")]
    public string OrderDate { get; set; } = string.Empty;

    [Name("Customer ID")]
    public string CustomerId { get; set; } = string.Empty;

    [Name("Customer Name")]
    public string CustomerName { get; set; } = string.Empty;

    [Name("Product ID")]
    public string ProductId { get; set; } = string.Empty;

    [Name("Product Name")]
    public string ProductName { get; set; } = string.Empty;

    [Name("Sales")]
    public decimal Sales { get; set; }

    [Name("Quantity")]
    public int Quantity { get; set; }
}

public static class CsvDatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, string csvFilePath, ILogger logger)
    {
        if (await context.Orders.AnyAsync() || await context.Products.AnyAsync() || await context.SalesHistories.AnyAsync())
        {
            logger.LogInformation("Database already seeded. Skipping CSV seed.");
            return;
        }

        if (!File.Exists(csvFilePath))
        {
            logger.LogWarning("CSV file not found at {CsvFilePath}. Skipping seed.", csvFilePath);
            return;
        }

        logger.LogInformation("Parsing CSV and seeding database... This may take a moment.");

        using var reader = new StreamReader(csvFilePath);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            HeaderValidated = null,
            MissingFieldFound = null
        });

        var records = csv.GetRecords<RetailSalesRecord>().ToList();
        
        logger.LogInformation("Found {Count} records in CSV.", records.Count);

        // Track what we've added to avoid duplicates
        var customersByCsvId = new Dictionary<string, Customer>();
        var productsByCsvId = new Dictionary<string, Product>();
        var ordersByCsvId = new Dictionary<string, Order>();

        // We will collect everything to insert in bulk (EF Core batches inserts)
        var customersToInsert = new List<Customer>();
        var productsToInsert = new List<Product>();
        var ordersToInsert = new List<Order>();
        var orderItemsToInsert = new List<OrderItem>();
        var salesHistoryToInsert = new List<SalesHistory>();

        var now = DateTime.UtcNow;

        foreach (var record in records)
        {
            // 1. Process Customer
            if (!customersByCsvId.TryGetValue(record.CustomerId, out var customer))
            {
                customer = new Customer
                {
                    Name = record.CustomerName,
                    Company = "Retail Customer", // Default since it's missing in CSV
                    Email = $"{record.CustomerName.Replace(" ", "").ToLower()}@example.com",
                    ContactNumber = "N/A",
                    CreatedAt = now
                };
                customersByCsvId[record.CustomerId] = customer;
                customersToInsert.Add(customer);
            }

            // 2. Process Product
            if (!productsByCsvId.TryGetValue(record.ProductId, out var product))
            {
                // Try to infer price from Sales / Quantity (if possible)
                decimal inferredPrice = record.Quantity > 0 ? Math.Round(record.Sales / record.Quantity, 2) : 0;

                product = new Product
                {
                    Name = record.ProductName,
                    Sku = record.ProductId,
                    CurrentStock = 100, // Arbitrary starting stock
                    ReorderPoint = 20,
                    Price = inferredPrice,
                    CreatedAt = now
                };
                productsByCsvId[record.ProductId] = product;
                productsToInsert.Add(product);
            }

            // 3. Process Order
            if (!ordersByCsvId.TryGetValue(record.OrderId, out var order))
            {
                DateTime parsedOrderDate = now;
                if (DateTime.TryParseExact(record.OrderDate, "MM/dd/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
                {
                    parsedOrderDate = d.ToUniversalTime();
                }

                order = new Order
                {
                    OrderNumber = record.OrderId,
                    Customer = customer,
                    OrderDate = parsedOrderDate,
                    Status = OrderStatus.Delivered,
                    TotalAmount = 0, // We will sum this up later
                    CreatedAt = now
                };
                ordersByCsvId[record.OrderId] = order;
                ordersToInsert.Add(order);
            }

            // 4. Process Order Item
            decimal unitPrice = record.Quantity > 0 ? Math.Round(record.Sales / record.Quantity, 2) : 0;

            var orderItem = new OrderItem
            {
                Order = order,
                Product = product,
                Quantity = record.Quantity,
                UnitPrice = unitPrice,
                CreatedAt = now
            };
            orderItemsToInsert.Add(orderItem);

            // Update Order Total
            order.TotalAmount += record.Sales;

            // 5. Add to SalesHistory for ML.NET
            var salesHistory = new SalesHistory
            {
                Product = product,
                Sku = product.Sku,
                Date = order.OrderDate,
                QuantitySold = record.Quantity,
                CreatedAt = now
            };
            salesHistoryToInsert.Add(salesHistory);
        }

        logger.LogInformation("Inserting {Count} Customers...", customersToInsert.Count);
        context.Customers.AddRange(customersToInsert);

        logger.LogInformation("Inserting {Count} Products...", productsToInsert.Count);
        // Temporarily enable identity insert if using SQL Server, or EF Core handles it
        context.Products.AddRange(productsToInsert);

        logger.LogInformation("Inserting {Count} Orders...", ordersToInsert.Count);
        context.Orders.AddRange(ordersToInsert);

        logger.LogInformation("Inserting {Count} Order Items...", orderItemsToInsert.Count);
        context.OrderItems.AddRange(orderItemsToInsert);

        logger.LogInformation("Inserting {Count} Sales History records...", salesHistoryToInsert.Count);
        context.SalesHistories.AddRange(salesHistoryToInsert);

        await context.SaveChangesAsync();

        logger.LogInformation("Database seeded successfully.");
    }
}
