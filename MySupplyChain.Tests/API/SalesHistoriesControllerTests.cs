using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using MySupplyChain.Application.SalesHistories.Commands.ImportSalesHistory;

namespace MySupplyChain.Tests.API;

public class SalesHistoriesControllerTests : BaseIntegrationTest
{
    public SalesHistoriesControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task ImportCsv_WithValidFile_ShouldParseAndAutoCreateProducts()
    {
        // Arrange
        var client = await GetAuthenticatedClientAsync("csv_user1");
        
        var csvContent = new StringBuilder();
        csvContent.AppendLine("Date,Store,ItemSku,UnitsSold,ExtraColumn");
        csvContent.AppendLine("2023-01-01,1,TEST-SKU-1,10,SomeData");
        csvContent.AppendLine("2023-01-02,1,TEST-SKU-1,15,SomeData");
        csvContent.AppendLine("2023-01-01,1,TEST-SKU-2,5,OtherData");

        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(csvContent.ToString()));
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("text/csv");

        using var form = new MultipartFormDataContent();
        form.Add(fileContent, "file", "test_import.csv");
        form.Add(new StringContent("ItemSku"), "skuColumn");
        form.Add(new StringContent("Date"), "dateColumn");
        form.Add(new StringContent("UnitsSold"), "quantityColumn");

        // Act
        var response = await client.PostAsync("/api/saleshistories/import", form);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var summary = await response.Content.ReadFromJsonAsync<ImportSummaryDto>();
        summary.Should().NotBeNull();
        summary!.RecordsImported.Should().Be(3);
        summary.NewProductsCreated.Should().Be(2); // TEST-SKU-1 and TEST-SKU-2

        // Verify products were created
        var productsResponse = await client.GetAsync("/api/products");
        var productsString = await productsResponse.Content.ReadAsStringAsync();
        productsString.Should().Contain("TEST-SKU-1");
        productsString.Should().Contain("TEST-SKU-2");
    }

    [Fact]
    public async Task ImportCsv_WithMissingHeaders_ShouldReturnBadRequest()
    {
        // Arrange
        var client = await GetAuthenticatedClientAsync("csv_user2");
        
        var csvContent = new StringBuilder();
        csvContent.AppendLine("SomeHeader"); // No actual data
        csvContent.AppendLine("SomeValue");

        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(csvContent.ToString()));
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("text/csv");

        using var form = new MultipartFormDataContent();
        form.Add(fileContent, "file", "bad_import.csv");
        form.Add(new StringContent("MissingSkuCol"), "skuColumn");
        form.Add(new StringContent("MissingDateCol"), "dateColumn");
        form.Add(new StringContent("MissingQtyCol"), "quantityColumn");

        // Act
        var response = await client.PostAsync("/api/saleshistories/import", form);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("One or more validation errors occurred.");
        content.Should().Contain("MissingSkuCol");
    }
}
