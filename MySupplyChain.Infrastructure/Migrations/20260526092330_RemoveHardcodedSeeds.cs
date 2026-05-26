using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MySupplyChain.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveHardcodedSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Products_ProductId",
                table: "OrderItems");

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 1001);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 1002);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 1003);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 2001);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 2002);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 2003);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 3001);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 3002);

            migrationBuilder.DeleteData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 3003);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.AlterColumn<string>(
                name: "OrderNumber",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "3b333929-f974-444e-a8d3-68f50a356d51",
                column: "ConcurrencyStamp",
                value: "ced2367d-53a6-431b-b6ed-979650f847f3");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "8e445865-a24d-4543-a6c6-9443d048cdb9",
                column: "ConcurrencyStamp",
                value: "31a05bc3-febe-4dfa-be08-81a40edab9cc");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Products_ProductId",
                table: "OrderItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Products_ProductId",
                table: "OrderItems");

            migrationBuilder.AlterColumn<string>(
                name: "OrderNumber",
                table: "Orders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Customers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "3b333929-f974-444e-a8d3-68f50a356d51",
                column: "ConcurrencyStamp",
                value: "3ade13d3-c97d-4895-941c-fad3b5194504");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "8e445865-a24d-4543-a6c6-9443d048cdb9",
                column: "ConcurrencyStamp",
                value: "4d127af8-d172-4313-95d4-926360443eec");

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Company", "ContactNumber", "CreatedAt", "Email", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Acme Corp", "", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "contact@acme.com", "Acme Corp Logistics", null },
                    { 2, "Global Tech", "", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "info@globaltech.com", "Global Tech Solutions", null },
                    { 3, "Stark Ind.", "", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "procurement@stark.com", "Stark Industries", null }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CreatedAt", "CurrentStock", "Name", "Price", "ReorderPoint", "Sku", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 50, "Laptop Dell XPS 13", 1299.99m, 15, "DELL-XPS-001", null },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 30, "iPhone 15 Pro", 999.99m, 10, "APPL-IP15-001", null },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 100, "Wireless Mouse", 79.99m, 25, "LOGI-MX-001", null }
                });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "Id", "CreatedAt", "CustomerId", "OrderDate", "OrderNumber", "Status", "TotalAmount", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2024, 1, 11, 0, 0, 0, 0, DateTimeKind.Utc), "#ORD-7782", 0, 12450.00m, null },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2024, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc), "#ORD-7781", 1, 8920.50m, null },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Utc), "#ORD-7780", 2, 45100.00m, null }
                });

            migrationBuilder.InsertData(
                table: "SalesHistories",
                columns: new[] { "Id", "AdditionalData", "CreatedAt", "Date", "ProductId", "QuantitySold", "Sku", "UpdatedAt" },
                values: new object[,]
                {
                    { 1001, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, "DELL-XPS-001", null },
                    { 1002, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, "DELL-XPS-001", null },
                    { 1003, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, "DELL-XPS-001", null },
                    { 2001, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 15, "APPL-IP15-001", null },
                    { 2002, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 12, "APPL-IP15-001", null },
                    { 2003, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, "APPL-IP15-001", null },
                    { 3001, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 45, "LOGI-MX-001", null },
                    { 3002, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 52, "LOGI-MX-001", null },
                    { 3003, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 38, "LOGI-MX-001", null }
                });

            migrationBuilder.InsertData(
                table: "OrderItems",
                columns: new[] { "Id", "CreatedAt", "OrderId", "ProductId", "Quantity", "UnitPrice", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, 5, 1299.99m, null },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 3, 7, 79.99m, null },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, 2, 8, 999.99m, null },
                    { 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3, 1, 3, 1299.99m, null }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Products_ProductId",
                table: "OrderItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
