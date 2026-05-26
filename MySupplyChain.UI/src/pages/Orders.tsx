import { useState, useEffect, useCallback } from "react";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import CreateOrderModal from "../components/CreateOrderModal";
import { orders as ordersApi } from "../lib/api";
import type { OrderDto } from "../types/api";

type StatusVariant = "processing" | "shipped" | "delivered" | "cancelled";

function statusVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (s === "shipped") return "shipped";
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  return "processing";
}

const tableHeaders = ["Order #", "Date", "Customer", "Items", "Status", "Total Amount", "Actions"];

export default function Orders() {
  const [data, setData] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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

  // Derived stats from real data
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
      <Topbar showSearch searchPlaceholder="Search orders by ID, customer, or status..." />

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
              className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-md py-sm bg-primary text-on-primary rounded-lg text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-xs shadow-[0_2px_12px_rgba(175,198,255,0.15)]"
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
            <button onClick={fetchOrders} className="ml-auto text-xs font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface rounded-xl border border-outline-variant p-md flex items-center gap-md hover:shadow-lg transition-shadow duration-300"
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <p className="text-xs font-semibold text-on-surface-variant tracking-wider">
              {loading ? "Loading..." : `Showing ${data.length} orders`}
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
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-md py-xl text-center text-sm text-on-surface-variant">
                      No orders found. Place your first order to get started.
                    </td>
                  </tr>
                ) : (
                  data.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container transition-colors duration-150 group">
                      <td className="px-md py-sm text-sm font-medium text-primary whitespace-nowrap">{order.orderNumber}</td>
                      <td className="px-md py-sm text-sm text-on-surface-variant whitespace-nowrap">{order.date}</td>
                      <td className="px-md py-sm text-sm text-on-surface font-medium">{order.customer}</td>
                      <td className="px-md py-sm text-sm text-on-surface-variant text-center tabular-nums">{order.items}</td>
                      <td className="px-md py-sm"><StatusBadge variant={statusVariant(order.status)} /></td>
                      <td className="px-md py-sm text-sm text-on-surface text-right font-medium tabular-nums">{order.total}</td>
                      <td className="px-md py-sm text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
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
    </>
  );
}
