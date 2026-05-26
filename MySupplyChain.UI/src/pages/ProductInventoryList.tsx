import { useState, useEffect, useCallback } from "react";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import CreateProductModal from "../components/CreateProductModal";
import CsvImportModal from "../components/CsvImportModal";
import { products } from "../lib/api";
import type { ProductDto } from "../types/api";

type SortKey = "sku" | "stock" | "health";

function healthVariant(status: string): "healthy" | "low-stock" | "out-of-stock" {
  if (status === "Low Stock") return "low-stock";
  return "healthy";
}

export default function ProductInventoryList() {
  const [data, setData] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("sku");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await products.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side sort
  const sorted = [...data].sort((a, b) => {
    if (sortKey === "sku") return a.sku.localeCompare(b.sku);
    if (sortKey === "stock") return a.currentStock - b.currentStock;
    return a.healthStatus.localeCompare(b.healthStatus);
  });

  const lowStockCount = data.filter((p) => p.healthStatus === "Low Stock").length;

  return (
    <>
      <Topbar showSearch searchPlaceholder="Search inventory, SKUs, or orders..." />

      <main className="flex-1 overflow-y-auto p-margin-desktop relative">
        {/* ── Page Header ── */}
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="text-[32px] leading-10 font-bold text-on-surface tracking-tight mb-1">
              Product Inventory
            </h2>
            <p className="text-base text-on-surface-variant">
              {loading
                ? "Loading..."
                : `${data.length.toLocaleString()} products · ${lowStockCount} low stock`}
            </p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setImportOpen(true)}
              className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Import CSV
            </button>
            <button className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button
              onClick={() => {
                const csv = [
                  "SKU,Name,Price,Stock,Reorder Point,Health",
                  ...data.map((p) => `${p.sku},"${p.name}",${p.price},${p.currentStock},${p.reorderPoint},${p.healthStatus}`),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "inventory_export.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="mb-lg p-md bg-error-container/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button onClick={fetchProducts} className="ml-auto text-xs font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Data Table Card ── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {/* Table Controls */}
          <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <p className="text-xs font-semibold text-on-surface-variant tracking-wider">
              {loading ? "Loading..." : `Showing ${sorted.length} items`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-on-surface-variant">Sort by:</span>
              <select
                className="bg-transparent border-none text-on-surface text-base font-semibold py-1 pl-2 pr-6 focus:ring-0 cursor-pointer"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="sku">SKU (Ascending)</option>
                <option value="stock">Stock (Low to High)</option>
                <option value="health">Health Status</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-outline-variant)]">
                <tr>
                  {["SKU", "Product Name", "Price", "Current Stock", "Reorder Point", "Health Status", "Actions"].map(
                    (header, i) => (
                      <th
                        key={header}
                        className={`px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap ${
                          [2, 3, 4].includes(i) ? "text-right" : i === 5 ? "text-center" : i === 6 ? "text-right" : ""
                        }`}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-md py-xl text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[24px] animate-spin mr-2 align-middle">
                        progress_activity
                      </span>
                      Loading products from API...
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-md py-xl text-center text-sm text-on-surface-variant">
                      No products found. Add your first product to get started.
                    </td>
                  </tr>
                ) : (
                  sorted.map((item) => {
                    const isLow = item.healthStatus === "Low Stock";
                    const isOut = item.currentStock === 0;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-surface-container transition-colors duration-150 group ${
                          isLow ? "bg-error-container/5" : ""
                        }`}
                      >
                        <td className="px-md py-sm text-sm text-on-surface whitespace-nowrap font-mono">
                          {item.sku}
                        </td>
                        <td className="px-md py-sm text-base font-semibold text-on-surface">
                          {item.name}
                        </td>
                        <td className="px-md py-sm text-sm text-on-surface-variant text-right tabular-nums">
                          ${item.price.toFixed(2)}
                        </td>
                        <td
                          className={`px-md py-sm text-sm text-right tabular-nums ${
                            isLow || isOut ? "text-error font-bold" : "text-on-surface"
                          }`}
                        >
                          {item.currentStock.toLocaleString()}
                        </td>
                        <td className="px-md py-sm text-sm text-on-surface-variant text-right tabular-nums">
                          {item.reorderPoint.toLocaleString()}
                        </td>
                        <td className="px-md py-sm text-center">
                          <StatusBadge
                            variant={isOut ? "out-of-stock" : healthVariant(item.healthStatus)}
                          />
                        </td>
                        <td className="px-md py-sm text-right">
                          <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
                            <span className="material-symbols-outlined text-[20px]">
                              more_vert
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAB → Opens CreateProductModal ── */}
        <button
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-margin-desktop right-margin-desktop bg-inverse-primary text-on-primary-fixed rounded-2xl px-lg py-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-primary hover:scale-105 transition-all duration-200 flex items-center gap-sm group z-50"
        >
          <span className="material-symbols-outlined text-[24px] transition-transform group-hover:rotate-90 duration-300">
            add
          </span>
          <span className="text-base font-semibold">Add Product</span>
        </button>
      </main>

      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchProducts}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={(summary) => {
          fetchProducts();
          // Optional: Add simple alert or dashboard log of success
          alert(`Successfully imported ${summary.recordsImported} sales records and created ${summary.newProductsCreated} new product placeholders!`);
        }}
      />
    </>
  );
}
