using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MySupplyChain.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesHistoryAdditionalData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdditionalData",
                table: "SalesHistories",
                type: "nvarchar(max)",
                nullable: true);

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

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 1001,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 1002,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 1003,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 2001,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 2002,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 2003,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 3001,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 3002,
                column: "AdditionalData",
                value: null);

            migrationBuilder.UpdateData(
                table: "SalesHistories",
                keyColumn: "Id",
                keyValue: 3003,
                column: "AdditionalData",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalData",
                table: "SalesHistories");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "3b333929-f974-444e-a8d3-68f50a356d51",
                column: "ConcurrencyStamp",
                value: "fa316325-6bda-43a6-a3be-1cd0a629fc9b");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "8e445865-a24d-4543-a6c6-9443d048cdb9",
                column: "ConcurrencyStamp",
                value: "3a567e95-260e-4c11-886b-c6785ca0a27a");
        }
    }
}
