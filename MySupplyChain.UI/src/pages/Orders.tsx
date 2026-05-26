import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import CreateOrderModal from "../components/CreateOrderModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { orders as ordersApi } from "../lib/api";
import type { OrderDto } from "../types/api";

type StatusVariant = "processing" | "shipped" | "delivered" | "cancelled";
type OrderStatusFilter = "All" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

function statusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (s === "shipped") return "shipped";
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  return "processing";
}

const tableHeaders = ["Order #", "Date", "Customer", "Items", "Status", "Total Amount", "Actions"];

export default function Orders() {
  const { onOpenSupport, onOpenSettings } = useOutletContext<{ onOpenSupport: () => void, onOpenSettings: () => void }>();
  const [data, setData] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<OrderStatusFilter>("All");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ordersApi.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeleteOrder = () => {
    if (deleteId === null) return;
    setData(prev => prev.filter(o => o.id !== deleteId));
    setDeleteId(null);
  };

  // Client-side filter
  const filtered = data.filter(o => {
    if (filter === "All") return true;
    return o.status.toLowerCase() === filter.toLowerCase();
  });

  const totalOrders = data.length;
  const processingCount = data.filter((o) => o.status.toLowerCase() === "processing").length;
  const shippedCount = data.filter((o) => o.status.toLowerCase() === "shipped").length;

  const summaryStats = [
    { label: "Total Orders", value: loading ? "—" : totalOrders.toLocaleString(), icon: "receipt_long" },
    { label: "Processing", value: loading ? "—" : processingCount.toLocaleString(), icon: "pending_actions" },
    { label: "Shipped", value: loading ? "—" : shippedCount.toLocaleString(), icon: "local_shipping" },
  ];

  return (
    <>
      <Topbar 
        showSearch 
        searchPlaceholder="Search orders by ID, customer, or status..." 
        onOpenSupport={onOpenSupport}
        onOpenSettings={onOpenSettings}
      />

      <main className="flex-1 overflow-y-auto p-margin-desktop">
        {/* ── Page Header ── */}
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="text-[32px] leading-10 font-bold text-on-surface tracking-tight mb-1">
              Orders
            </h2>
            <p className="text-base text-on-surface-variant">
              {loading
                ? "Loading..."
                : `${totalOrders.toLocaleString()} orders · ${processingCount} processing`}
            </p>
          </div>
          <div className="flex gap-sm">
            <div className="relative group">
              <button className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Status: {filter}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden border-white/5">
                {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as OrderStatusFilter)}
                    className="w-full text-left px-md py-3 text-sm font-medium hover:bg-surface-container-highest transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const csv = [
                  "Order Number,Date,Customer,Items,Status,Total",
                  ...data.map((o) => `${o.orderNumber},"${o.date}","${o.customer}",${o.items},${o.status},"${o.total}"`),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "orders_export.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-md py-sm bg-primary text-on-primary rounded-lg text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-xs shadow-[0_2px_12px_rgba(175,198,255,0.15)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Order
            </button>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="mb-lg p-md bg-error-container/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button onClick={fetchOrders} className="ml-auto text-xs font-semibold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-md flex items-center gap-md shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  {stat.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-on-surface-variant font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-on-surface tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Orders Table ── */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <p className="text-xs font-semibold text-on-surface-variant tracking-wider">
              {loading ? "Loading..." : `Showing ${filtered.length} orders`}
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-outline-variant)]">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th
                      key={header}
                      className={`px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap ${
                        i === 3 ? "text-center" : i === 5 ? "text-right" : i === 6 ? "text-right" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-md py-xl text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[24px] animate-spin mr-2 align-middle">
                        progress_activity
                      </span>
                      Loading orders from API...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-md py-xl text-center text-sm text-on-surface-variant">
                      No orders found matching your selection.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container transition-colors duration-150 group">
                      <td className="px-md py-sm text-sm font-medium text-primary whitespace-nowrap font-mono">{order.orderNumber}</td>
                      <td className="px-md py-sm text-sm text-on-surface-variant whitespace-nowrap font-mono">{order.date}</td>
                      <td className="px-md py-sm text-sm text-on-surface font-medium">{order.customer}</td>
                      <td className="px-md py-sm text-sm text-on-surface-variant text-center font-mono">{order.items}</td>
                      <td className="px-md py-sm"><StatusBadge variant={statusVariant(order.status)} /></td>
                      <td className="px-md py-sm text-sm text-on-surface text-right font-medium font-mono">{order.total}</td>
                      <td className="px-md py-sm text-right">
                        <div className="relative group/menu">
                          <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                          <div className="absolute right-0 top-0 mt-8 w-44 bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden border-white/5">
                            <button 
                              onClick={() => alert("Tracking feature coming soon!")}
                              className="w-full text-left px-md py-3 text-xs font-bold hover:bg-primary hover:text-on-primary flex items-center gap-3 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                              Track Order
                            </button>
                            <button 
                              onClick={() => setDeleteId(order.id)}
                              className="w-full text-left px-md py-3 text-xs font-bold text-error hover:bg-error hover:text-on-error flex items-center gap-3 transition-colors border-t border-outline-variant/20"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Cancel / Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchOrders}
      />

      <ConfirmationModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteOrder}
        title="Cancel Order?"
        message="Are you sure you want to cancel and delete this order? This record will be removed from your active operations."
        confirmText="Yes, Cancel"
        isDanger={true}
      />
    </>
  );
}
