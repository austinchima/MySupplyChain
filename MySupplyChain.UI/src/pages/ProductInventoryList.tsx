import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import CreateProductModal from "../components/CreateProductModal";
import CsvImportModal from "../components/CsvImportModal";
import ConfirmationModal from "../components/ConfirmationModal";
import UpdateReorderPointModal from "../components/UpdateReorderPointModal";
import { products } from "../lib/api";
import type { ProductDto } from "../types/api";

type SortKey = "sku" | "stock" | "health";
type HealthFilter = "All" | "Healthy" | "Low Stock" | "Out of Stock";

function healthVariant(status: string): "healthy" | "low-stock" | "out-of-stock" {
  if (status === "Low Stock") return "low-stock";
  return "healthy";
}

export default function ProductInventoryList() {
  const { onOpenSupport, onOpenSettings } = useOutletContext<{ onOpenSupport: () => void, onOpenSettings: () => void }>();
  const [data, setData] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("sku");
  const [filter, setFilter] = useState<HealthFilter>("All");
  
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateReorderProduct, setUpdateReorderProduct] = useState<ProductDto | null>(null);

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

  const handleDeleteProduct = async () => {
    if (deleteId === null) return;
    try {
      await products.delete(deleteId);
      setData(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  // Client-side filter & sort
  const filtered = data.filter(p => {
    if (filter === "All") return true;
    if (filter === "Out of Stock") return p.currentStock === 0;
    return p.healthStatus === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "sku") return a.sku.localeCompare(b.sku);
    if (sortKey === "stock") return a.currentStock - b.currentStock;
    return a.healthStatus.localeCompare(b.healthStatus);
  });

  const lowStockCount = data.filter((p) => p.healthStatus === "Low Stock").length;

  return (
    <>
      <Topbar 
        showSearch 
        searchPlaceholder="Search inventory, SKUs, or orders..." 
        onOpenSupport={onOpenSupport}
        onOpenSettings={onOpenSettings}
      />

      <main className="flex-1 overflow-y-auto p-margin-desktop relative font-['Outfit']">
        {/* ── Page Header ── */}
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="text-[32px] leading-10 font-bold text-on-surface tracking-tight mb-1">
              Product Inventory
            </h2>
            <p className="text-base text-on-surface-variant">
              {loading
                ? "Loading system records..."
                : `${data.length.toLocaleString()} items registered · ${lowStockCount} critical alerts`}
            </p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setImportOpen(true)}
              className="px-md py-sm border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-xs cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
              Bulk Import
            </button>
            
            <div className="relative group">
              <button className="px-md py-sm border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-xs cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Status: {filter}
              </button>
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden border-white/5">
                {["All", "Healthy", "Low Stock", "Out of Stock"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as HealthFilter)}
                    className="w-full text-left px-md py-3 text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-between"
                  >
                    {f}
                    {filter === f && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                ))}
              </div>
            </div>

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
                a.download = `inventory_dump_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-md py-sm border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-xs cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="mb-lg p-md bg-error-container/10 border border-error/30 rounded-2xl text-sm text-error flex items-center gap-sm shadow-lg">
            <span className="material-symbols-outlined">error</span>
            <span className="font-medium">{error}</span>
            <button onClick={fetchProducts} className="ml-auto text-xs font-bold underline cursor-pointer">
              Reconnect
            </button>
          </div>
        )}

        {/* ── Data Table Card ── */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-white/5">
          {/* Table Controls */}
          <div className="px-md py-sm border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              {loading ? "Syncing..." : `Database: ${sorted.length} Entries`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Sort:</span>
              <select
                className="bg-transparent border-none text-on-surface text-xs font-bold py-1 pl-2 pr-6 focus:ring-0 cursor-pointer outline-none"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="sku">SKU (ID)</option>
                <option value="stock">Current Stock</option>
                <option value="health">Inventory Health</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high/50 sticky top-0 z-10">
                <tr>
                  {["SKU", "Product Description", "Price", "In Stock", "Threshold", "Health Status", ""].map(
                    (header, i) => (
                      <th
                        key={header}
                        className={`px-md py-4 text-[10px] font-black text-outline uppercase tracking-widest whitespace-nowrap border-b border-outline-variant/20 ${
                          [2, 3, 4].includes(i) ? "text-right" : i === 5 ? "text-center" : ""
                        }`}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-md py-24 text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[32px] animate-spin mb-2 block mx-auto text-primary">
                        progress_activity
                      </span>
                      Connecting to enterprise cloud...
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-md py-24 text-center text-sm text-on-surface-variant">
                      <div className="max-w-xs mx-auto space-y-2">
                        <span className="material-symbols-outlined text-[48px] text-outline opacity-20">inventory_2</span>
                        <p className="font-bold text-on-surface">No inventory data available.</p>
                        <p className="text-xs">Import a CSV or create a product manually to populate the terminal.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((item) => {
                    const isLow = item.healthStatus === "Low Stock";
                    const isOut = item.currentStock === 0;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-primary/5 transition-all duration-150 group cursor-default ${
                          isLow ? "bg-error-container/5" : ""
                        }`}
                      >
                        <td className="px-md py-4 text-xs font-bold text-primary font-mono whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="px-md py-4">
                          <p className="text-sm font-bold text-on-surface">{item.name}</p>
                          <p className="text-[10px] text-outline font-medium tracking-tight mt-0.5">Physical Asset · Active</p>
                        </td>
                        <td className="px-md py-4 text-xs text-on-surface text-right font-bold font-mono tabular-nums">
                          ${item.price.toFixed(2)}
                        </td>
                        <td
                          className={`px-md py-4 text-sm text-right font-bold font-mono tabular-nums ${
                            isLow || isOut ? "text-error" : "text-on-surface"
                          }`}
                        >
                          {item.currentStock.toLocaleString()}
                        </td>
                        <td className="px-md py-4 text-xs text-outline text-right font-bold font-mono tabular-nums">
                          {item.reorderPoint.toLocaleString()}
                        </td>
                        <td className="px-md py-4 text-center">
                          <StatusBadge
                            variant={isOut ? "out-of-stock" : healthVariant(item.healthStatus)}
                          />
                        </td>
                        <td className="px-md py-4 text-right">
                          <div className="relative group/menu">
                            <button className="text-outline hover:text-primary transition-all p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer">
                              <span className="material-symbols-outlined text-[20px]">
                                more_horiz
                              </span>
                            </button>
                            <div className="absolute right-0 top-0 mt-8 w-48 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden border-white/5">
                              <button 
                                onClick={() => setUpdateReorderProduct(item)}
                                className="w-full text-left px-md py-3.5 text-xs font-bold hover:bg-primary hover:text-on-primary flex items-center gap-3 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                Configure Reorder
                              </button>
                              <button 
                                onClick={() => setDeleteId(item.id)}
                                className="w-full text-left px-md py-3.5 text-xs font-bold text-error hover:bg-error hover:text-on-error flex items-center gap-3 transition-colors border-t border-outline-variant/20"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                Purge Item
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAB ── */}
        <button
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-10 right-10 bg-primary text-on-primary rounded-2xl px-lg py-4 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-sm group z-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px] transition-transform group-hover:rotate-90 duration-300">
            add
          </span>
          <span className="text-base font-bold">New Entry</span>
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
        }}
      />

      <ConfirmationModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteProduct}
        title="Purge System Entry?"
        message="This will permanently remove the product and all associated telemetry from the central database. This action cannot be reversed."
        confirmText="Confirm Purge"
        isDanger={true}
      />

      {updateReorderProduct && (
        <UpdateReorderPointModal
          open={true}
          onClose={() => setUpdateReorderProduct(null)}
          onUpdated={fetchProducts}
          productId={updateReorderProduct.id}
          productName={updateReorderProduct.name}
          currentValue={updateReorderProduct.reorderPoint}
        />
      )}
    </>
  );
}
