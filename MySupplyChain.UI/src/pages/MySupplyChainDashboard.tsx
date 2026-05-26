import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import SummaryCard from "../components/SummaryCard";
import StatusBadge from "../components/StatusBadge";
import { products as productsApi, reorderRequests as reorderApi } from "../lib/api";
import type { ProductDto, ReorderRequestDto } from "../types/api";

export default function Dashboard() {
  const { onOpenSupport, onOpenSettings } = useOutletContext<{ onOpenSupport: () => void, onOpenSettings: () => void }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [alerts, setAlerts] = useState<ReorderRequestDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, reorders] = await Promise.all([
        productsApi.getAll(),
        reorderApi.getAll(),
      ]);
      setProducts(prods);
      setAlerts(reorders);
    } catch {
      // Silently fall back to empty — will show zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived stats from real data
  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.healthStatus === "Low Stock").length;

  return (
    <>
      <Topbar 
        title="Overview" 
        showSearch 
        searchPlaceholder="Search inventory, orders, or alerts..." 
        onOpenSupport={onOpenSupport}
        onOpenSettings={onOpenSettings}
      />

      <main className="flex-1 overflow-y-auto p-margin-desktop">
        <div className="max-w-[1600px] mx-auto space-y-lg">
          {/* ── Summary Cards (derived from GET /api/products) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <SummaryCard
              title="Active Products"
              value={loading ? "—" : totalProducts.toLocaleString()}
              icon="inventory"
              accent="primary"
            />
            <SummaryCard
              title="Reorder Requests"
              value={loading ? "—" : alerts.length.toLocaleString()}
              icon="shopping_cart_checkout"
              accent="secondary"
            />
            <SummaryCard
              title="Low Stock Items"
              value={loading ? "—" : lowStockItems.toLocaleString()}
              icon="warning"
              accent="error"
            >
              {lowStockItems > 0 && (
                <span className="text-[11px] font-medium text-error flex items-center gap-0.5 pb-1">
                  Requires attention
                </span>
              )}
            </SummaryCard>
          </div>

          {/* ── Main Content Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Critical Alerts — from GET /api/reorderrequests */}
            <div className="lg:col-span-4 flex flex-col gap-sm">
              <h3 className="text-base font-semibold text-on-surface px-xs">
                Reorder Alerts
              </h3>
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                  <div className="p-md text-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px] animate-spin mr-2 align-middle">
                      progress_activity
                    </span>
                    Loading...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="p-md text-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px] mr-2 align-middle text-secondary">
                      check_circle
                    </span>
                    No reorder alerts. All stock levels healthy.
                  </div>
                ) : (
                  <ul className="divide-y divide-outline-variant/50">
                    {alerts.slice(0, 5).map((alert) => (
                      <li
                        key={alert.id}
                        onClick={() => navigate("/forecasting")}
                        className="p-md hover:bg-surface-container transition-colors flex gap-sm items-start cursor-pointer group"
                      >
                        <div className="mt-1 w-2 h-2 rounded-full bg-error shrink-0 shadow-[0_0_8px_rgba(255,180,171,0.6)]" />
                        <div className="flex-1">
                          <p className="text-sm text-on-surface font-medium group-hover:text-primary transition-colors">
                            {alert.productName}
                          </p>
                          <div className="flex items-center gap-md mt-1">
                            <span className="text-xs text-error font-bold">
                              Need: {alert.quantityToOrder.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">
                              Predicted Demand: {alert.predictedDemand.toLocaleString()}
                            </span>
                          </div>
                          {alert.justification && (
                            <p className="text-[10px] text-on-surface-variant mt-1 italic leading-relaxed">
                              {alert.justification}
                            </p>
                          )}
                        </div>
                        <button className="text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {alerts.length > 5 && (
                  <div className="p-sm border-t border-outline-variant/50 bg-surface-container-lowest">
                    <button 
                      onClick={() => navigate("/forecasting")}
                      className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    >
                      View All {alerts.length} Alerts
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Products Table — from GET /api/products, filtered */}
            <div className="lg:col-span-8 flex flex-col gap-sm">
              <div className="flex justify-between items-end px-xs">
                <h3 className="text-base font-semibold text-on-surface">
                  Low Stock Products
                </h3>
                <button 
                  onClick={() => navigate("/inventory")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Manage Inventory
                </button>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        {["SKU", "Product", "Stock", "Reorder At", "Health"].map((header, i) => (
                          <th
                            key={header}
                            className={`py-sm px-md text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${
                              [2, 3].includes(i) ? "text-right" : ""
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-sm text-on-surface">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-md py-lg text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[20px] animate-spin mr-2 align-middle">
                              progress_activity
                            </span>
                            Loading...
                          </td>
                        </tr>
                      ) : (
                        products
                          .filter((p) => p.healthStatus === "Low Stock")
                          .slice(0, 10)
                          .map((p) => (
                            <tr 
                              key={p.id} 
                              onClick={() => navigate("/inventory")}
                              className="hover:bg-surface-container transition-colors bg-error-container/5 cursor-pointer"
                            >
                              <td className="py-md px-md font-mono text-xs">{p.sku}</td>
                              <td className="py-md px-md font-medium">{p.name}</td>
                              <td className="py-md px-md text-right text-error font-bold tabular-nums">
                                {p.currentStock.toLocaleString()}
                              </td>
                              <td className="py-md px-md text-right text-on-surface-variant tabular-nums">
                                {p.reorderPoint.toLocaleString()}
                              </td>
                              <td className="py-md px-md">
                                <StatusBadge variant={p.currentStock === 0 ? "out-of-stock" : "low-stock"} />
                              </td>
                            </tr>
                          ))
                      )}
                      {!loading && products.filter((p) => p.healthStatus === "Low Stock").length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-md py-lg text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[20px] text-secondary mr-2 align-middle">
                              check_circle
                            </span>
                            All products are healthy. No low stock items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
