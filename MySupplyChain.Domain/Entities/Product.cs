namespace MySupplyChain.Domain.Entities
{
    /// <summary>
    /// Represents a catalog product within the inventory management system.
    /// Tracks current physical stock levels, reorder thresholds, and associated historical sales transactions.
    /// </summary>
    public class Product : EntityBase
    {
        /// <summary>
        /// Gets or sets the descriptive name of the product.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the unique Stock Keeping Unit (SKU) code used for supply chain identification.
        /// </summary>
        public string Sku { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the current quantity of physical stock available in the warehouse.
        /// </summary>
        public int CurrentStock { get; set; }

        /// <summary>
        /// Gets or sets the critical threshold stock level. When CurrentStock falls below or equals this value,
        /// the automated restocking logic is triggered.
        /// </summary>
        public int ReorderPoint { get; set; }

        /// <summary>
        /// Gets or sets the retail price of the product per unit.
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// Gets or sets the collection of past sales records for this product.
        /// Used directly by the forecasting engine to calculate demand trends.
        /// </summary>
        public List<SalesHistory> SalesHistory { get; set; } = new();
    }
}
