using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MySupplyChain.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierLeadTimeTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                table: "ReorderRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActualLeadTimeDays",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReceivedDate",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    PromisedLeadTimeDays = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "3b333929-f974-444e-a8d3-68f50a356d51",
                column: "ConcurrencyStamp",
                value: "eb259a72-1967-4edd-a357-a7d4e7e10301");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "8e445865-a24d-4543-a6c6-9443d048cdb9",
                column: "ConcurrencyStamp",
                value: "84cd7275-6c5e-4251-abe7-363272f69fb3");

            migrationBuilder.InsertData(
                table: "Suppliers",
                columns: new[] { "Id", "Email", "IsActive", "Name", "PromisedLeadTimeDays" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "orders@swiftparts.com", true, "SwiftParts Co.", 5 },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "procurement@globalstock.com", true, "GlobalStock Ltd.", 7 },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "supply@overseasgoods.com", true, "OverseasGoods Inc.", 14 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReorderRequests_SupplierId",
                table: "ReorderRequests",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_SupplierId",
                table: "Orders",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Suppliers_SupplierId",
                table: "Orders",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ReorderRequests_Suppliers_SupplierId",
                table: "ReorderRequests",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Suppliers_SupplierId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_ReorderRequests_Suppliers_SupplierId",
                table: "ReorderRequests");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_ReorderRequests_SupplierId",
                table: "ReorderRequests");

            migrationBuilder.DropIndex(
                name: "IX_Orders_SupplierId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "ReorderRequests");

            migrationBuilder.DropColumn(
                name: "ActualLeadTimeDays",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ReceivedDate",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "3b333929-f974-444e-a8d3-68f50a356d51",
                column: "ConcurrencyStamp",
                value: "0f674413-6074-425f-9917-c083b7c8c3f0");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "8e445865-a24d-4543-a6c6-9443d048cdb9",
                column: "ConcurrencyStamp",
                value: "19985907-c1de-47ac-b722-f99ef84fe7e8");
        }
    }
}
