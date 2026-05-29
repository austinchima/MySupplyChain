import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import CreateOrderModal from "../components/CreateOrderModal";
import ConfirmationModal from "../components/ConfirmationModal";
import OrderTrackerModal from "../components/OrderTrackerModal";
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

const tableHeaders = ["Order ID", "Timestamp", "Customer Entity", "SKU Units", "Status", "Contract Value", ""];

export default function Orders() {
  const { onOpenSupport, onOpenSettings } = useOutletContext<{ onOpenSupport: () => void, onOpenSettings: () => void }>();
  const [data, setData] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<OrderStatusFilter>("All");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [trackOrder, setTrackOrder] = useState<OrderDto | null>(null);

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
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleDeleteOrder = async () => {
    if (deleteId === null) return;
    try {
      await ordersApi.delete(deleteId);
      setData(prev => prev.filter(o => o.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order.");
    }
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await ordersApi.updateStatus(id, { id, status });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
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
    { label: "Total Transactions", value: loading ? "—" : totalOrders.toLocaleString(), icon: "receipt_long" },
    { label: "Awaiting Logistics", value: loading ? "—" : processingCount.toLocaleString(), icon: "pending_actions" },
    { label: "In Transit", value: loading ? "—" : shippedCount.toLocaleString(), icon: "local_shipping" },
  ];

  return (
    <>
      <Topbar 
        showSearch 
        searchPlaceholder="Search order ledger..." 
        onOpenSupport={onOpenSupport}
        onOpenSettings={onOpenSettings}
      />

      <main className="flex-1 overflow-y-auto p-margin-desktop font-['Outfit']">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md mb-lg">
          <div className="min-w-0">
            <h2 className="text-[32px] leading-10 font-bold text-on-surface tracking-tight mb-1 truncate">
              Order Ledger
            </h2>
            <p className="text-base text-on-surface-variant">
              {loading
                ? "Synchronizing ledger..."
                : `${totalOrders.toLocaleString()} total entries · ${processingCount} active fulfillments`}
            </p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <div className="relative group">
              <button className="px-md py-sm border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-xs cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Status: {filter}
              </button>
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as OrderStatusFilter)}
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
                  "Order Number,Date,Customer,Items,Status,Total",
                  ...data.map((o) => `${o.orderNumber},"${o.date}","${o.customer}",${o.items},${o.status},"${o.total}"`),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `order_ledger_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-md py-sm border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-xs cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-md py-sm bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-xs shadow-lg shadow-primary/20 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Order
            </button>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="mb-lg p-md bg-error-container/10 border border-error/30 rounded-2xl text-sm text-error flex items-center gap-sm shadow-lg">
            <span className="material-symbols-outlined">error</span>
            <span className="font-medium">{error}</span>
            <button onClick={fetchOrders} className="ml-auto text-xs font-bold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-md flex items-center gap-md shadow-xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  {stat.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-outline font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-on-surface tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Orders Table ── */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="px-md py-sm border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              {loading ? "Syncing..." : `Showing ${filtered.length} Fulfillments`}
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high/50 sticky top-0 z-10">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th
                      key={header}
                      className={`px-md py-4 text-[10px] font-black text-outline uppercase tracking-widest whitespace-nowrap border-b border-outline-variant/20 ${
                        i === 0 ? "min-w-[120px]" : 
                        i === 1 ? "min-w-[140px]" :
                        i === 2 ? "min-w-[200px]" :
                        i === 3 ? "text-center min-w-[100px]" : 
                        i === 4 ? "min-w-[120px]" :
                        i === 5 ? "text-right min-w-[120px]" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-md py-24 text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[32px] animate-spin mb-2 block mx-auto text-primary">
                        progress_activity
                      </span>
                      Syncing transaction ledger...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-md py-24 text-center text-sm text-on-surface-variant">
                      <div className="max-w-sm mx-auto space-y-3 px-md">
                        <span className="material-symbols-outlined text-[48px] text-outline opacity-20">receipt_long</span>
                        <div className="space-y-1">
                          <p className="font-bold text-on-surface text-base">No orders found.</p>
                          <p className="text-xs leading-relaxed max-w-[280px] mx-auto">
                            Your fulfillment queue is currently empty. Active transactions will appear here.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-primary/5 transition-all duration-150 group cursor-default">
                      <td className="px-md py-4 text-xs font-bold text-primary font-mono whitespace-nowrap">{order.orderNumber}</td>
                      <td className="px-md py-4 text-xs text-on-surface-variant whitespace-nowrap font-mono">{order.date}</td>
                      <td className="px-md py-4 text-sm font-bold text-on-surface min-w-[200px]">{order.customer}</td>
                      <td className="px-md py-4 text-xs text-on-surface-variant text-center font-mono font-bold">{order.items}</td>
                      <td className="px-md py-4"><StatusBadge variant={statusVariant(order.status)} /></td>
                      <td className="px-md py-4 text-xs text-on-surface text-right font-bold font-mono tabular-nums">{order.total}</td>
                      <td className="px-md py-4 text-right">
                        <div className="relative group/menu">
                          <button className="text-outline hover:text-primary transition-all p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                          </button>
                          <div className="absolute right-0 top-0 mt-8 w-48 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                            <button 
                              onClick={() => setTrackOrder(order)}
                              className="w-full text-left px-md py-3.5 text-xs font-bold hover:bg-primary hover:text-on-primary flex items-center gap-3 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                              Track Logistics
                            </button>
                            <div className="p-2 border-t border-outline-variant/20">
                                <p className="px-2 pb-2 text-[10px] font-black text-outline uppercase tracking-widest">Update State</p>
                                {[
                                  { l: 'Shipped', v: 1 },
                                  { l: 'Delivered', v: 2 }
                                ].map(st => (
                                  <button 
                                    key={st.v}
                                    onClick={() => handleUpdateStatus(order.id, st.v)}
                                    className="w-full text-left px-2 py-1.5 text-[11px] font-bold rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit_square</span>
                                    Mark as {st.l}
                                  </button>
                                ))}
                            </div>
                            <button 
                              onClick={() => setDeleteId(order.id)}
                              className="w-full text-left px-md py-3.5 text-xs font-bold text-error hover:bg-error hover:text-on-error flex items-center gap-3 transition-colors border-t border-outline-variant/20"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                              Void Transaction
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

      {trackOrder && (
        <OrderTrackerModal
          open={true}
          onClose={() => setTrackOrder(null)}
          orderNumber={trackOrder.orderNumber}
          customerName={trackOrder.customer}
          status={trackOrder.status}
          date={trackOrder.date}
        />
      )}

      <ConfirmationModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteOrder}
        title="Void Transaction?"
        message="Are you sure you want to cancel and purge this order? This record will be permanently removed from the active fulfillment queue."
        confirmText="Confirm Void"
        isDanger={true}
      />
    </>
  );
}
