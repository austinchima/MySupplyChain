using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MySupplyChain.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Sku = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStock = table.Column<int>(type: "int", nullable: false),
                    ReorderPoint = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReorderRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    QuantityToOrder = table.Column<int>(type: "int", nullable: false),
                    PredictedDemand = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReorderRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReorderRequests_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    QuantitySold = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesHistories_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                table: "SalesHistories",
                columns: new[] { "Id", "CreatedAt", "Date", "ProductId", "QuantitySold", "UpdatedAt" },
                values: new object[,]
                {
                    { 1000, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1001, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1002, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 6, null },
                    { 1003, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1004, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1005, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, null },
                    { 1006, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1007, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1008, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1009, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16, null },
                    { 1010, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, null },
                    { 1011, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, null },
                    { 1012, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1013, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 9, null },
                    { 1014, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, null },
                    { 1015, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, null },
                    { 1016, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1017, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1018, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 17, null },
                    { 1019, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 13, null },
                    { 1020, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, null },
                    { 1021, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1022, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 6, null },
                    { 1023, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1024, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 17, null },
                    { 1025, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 13, null },
                    { 1026, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1027, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1028, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1029, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 18, null },
                    { 1030, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1031, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1032, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1033, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1034, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 9, null },
                    { 1035, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 13, null },
                    { 1036, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 17, null },
                    { 1037, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1038, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 13, null },
                    { 1039, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 17, null },
                    { 1040, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16, null },
                    { 1041, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, null },
                    { 1042, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1043, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1044, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1045, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16, null },
                    { 1046, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 14, null },
                    { 1047, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 6, null },
                    { 1048, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, null },
                    { 1049, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16, null },
                    { 1050, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 9, null },
                    { 1051, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 14, null },
                    { 1052, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1053, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1054, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 14, null },
                    { 1055, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1056, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1057, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 11, null },
                    { 1058, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1059, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 14, null },
                    { 1060, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 8, null },
                    { 1061, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1062, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, null },
                    { 1063, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 9, null },
                    { 1064, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 6, null },
                    { 1065, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 15, null },
                    { 1066, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 6, null },
                    { 1067, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 11, null },
                    { 1068, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1069, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16, null },
                    { 1070, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 11, null },
                    { 1071, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1072, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 12, null },
                    { 1073, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1074, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 17, null },
                    { 1075, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1076, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1077, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1078, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 14, null },
                    { 1079, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1080, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 18, null },
                    { 1081, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 18, null },
                    { 1082, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 11, null },
                    { 1083, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, null },
                    { 1084, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 14, null },
                    { 1085, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 5, null },
                    { 1086, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10, null },
                    { 1087, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7, null },
                    { 1088, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 11, null },
                    { 1089, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16, null },
                    { 2000, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 12, null },
                    { 2001, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 11, null },
                    { 2002, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2003, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2004, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2005, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 16, null },
                    { 2006, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2007, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2008, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2009, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2010, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 15, null },
                    { 2011, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2012, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2013, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 11, null },
                    { 2014, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2015, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 16, null },
                    { 2016, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2017, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2018, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8, null },
                    { 2019, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2020, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 12, null },
                    { 2021, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2022, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 16, null },
                    { 2023, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 15, null },
                    { 2024, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 15, null },
                    { 2025, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2026, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2027, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2028, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 14, null },
                    { 2029, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2030, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 10, null },
                    { 2031, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2032, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2033, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8, null },
                    { 2034, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8, null },
                    { 2035, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2036, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8, null },
                    { 2037, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2038, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 11, null },
                    { 2039, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2040, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2041, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2042, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2043, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2044, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2045, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 16, null },
                    { 2046, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 17, null },
                    { 2047, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2048, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2049, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 17, null },
                    { 2050, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2051, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8, null },
                    { 2052, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2053, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 17, null },
                    { 2054, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2055, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2056, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 14, null },
                    { 2057, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 14, null },
                    { 2058, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2059, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2060, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2061, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2062, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8, null },
                    { 2063, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2064, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2065, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 16, null },
                    { 2066, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2067, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2068, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2069, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 9, null },
                    { 2070, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2071, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2072, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 15, null },
                    { 2073, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2074, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2075, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 10, null },
                    { 2076, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 18, null },
                    { 2077, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 11, null },
                    { 2078, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 10, null },
                    { 2079, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2080, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 11, null },
                    { 2081, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 13, null },
                    { 2082, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2083, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 17, null },
                    { 2084, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2085, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 6, null },
                    { 2086, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5, null },
                    { 2087, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 7, null },
                    { 2088, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 19, null },
                    { 2089, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 15, null },
                    { 3000, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 11, null },
                    { 3001, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 13, null },
                    { 3002, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 11, null },
                    { 3003, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 6, null },
                    { 3004, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3005, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3006, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3007, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 7, null },
                    { 3008, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10, null },
                    { 3009, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 13, null },
                    { 3010, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 14, null },
                    { 3011, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3012, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 17, null },
                    { 3013, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 16, null },
                    { 3014, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3015, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10, null },
                    { 3016, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 12, null },
                    { 3017, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 17, null },
                    { 3018, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 8, null },
                    { 3019, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3020, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 14, null },
                    { 3021, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 7, null },
                    { 3022, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3023, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 8, null },
                    { 3024, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 17, null },
                    { 3025, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 14, null },
                    { 3026, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 6, null },
                    { 3027, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 11, null },
                    { 3028, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 17, null },
                    { 3029, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3030, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 16, null },
                    { 3031, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3032, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3033, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 11, null },
                    { 3034, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3035, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3036, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 7, null },
                    { 3037, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 13, null },
                    { 3038, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 8, null },
                    { 3039, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 14, null },
                    { 3040, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 12, null },
                    { 3041, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 15, null },
                    { 3042, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 6, null },
                    { 3043, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 17, null },
                    { 3044, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10, null },
                    { 3045, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 12, null },
                    { 3046, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 15, null },
                    { 3047, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 8, null },
                    { 3048, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 12, null },
                    { 3049, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 16, null },
                    { 3050, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 13, null },
                    { 3051, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 7, null },
                    { 3052, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3053, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 5, null },
                    { 3054, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 5, null },
                    { 3055, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 8, null },
                    { 3056, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3057, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 7, null },
                    { 3058, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3059, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 2, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3060, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3061, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 12, null },
                    { 3062, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10, null },
                    { 3063, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 11, null },
                    { 3064, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 16, null },
                    { 3065, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 14, null },
                    { 3066, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3067, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10, null },
                    { 3068, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 17, null },
                    { 3069, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3070, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 7, null },
                    { 3071, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3072, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 13, null },
                    { 3073, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 14, null },
                    { 3074, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10, null },
                    { 3075, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 19, null },
                    { 3076, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 6, null },
                    { 3077, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 12, null },
                    { 3078, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3079, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3080, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3081, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3082, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3083, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 5, null },
                    { 3084, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 9, null },
                    { 3085, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 13, null },
                    { 3086, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 5, null },
                    { 3087, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 18, null },
                    { 3088, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 11, null },
                    { 3089, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 3, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 15, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReorderRequests_ProductId",
                table: "ReorderRequests",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesHistories_ProductId",
                table: "SalesHistories",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReorderRequests");

            migrationBuilder.DropTable(
                name: "SalesHistories");

            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
