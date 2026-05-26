import { useState } from "react";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import CreateOrderModal from "../components/CreateOrderModal";

type OrderStatus = "processing" | "shipped" | "delivered";

interface Order {
  id: string;
  date: string;
  customer: string;
  items: number;
  status: OrderStatus;
  total: string;
}

// NOTE: The backend currently only supports POST /api/orders (create).
// There is no GET /api/orders endpoint. This data is mock/static until
// a GetAllOrders query is added to the backend.
const ordersData: Order[] = [
  { id: "#ORD-7782", date: "Oct 24, 14:30", customer: "Acme Corp Logistics", items: 12, status: "processing", total: "$12,450.00" },
  { id: "#ORD-7781", date: "Oct 24, 11:15", customer: "Global Tech Solutions", items: 8, status: "shipped", total: "$8,920.50" },
  { id: "#ORD-7780", date: "Oct 23, 16:45", customer: "Apex Manufacturing", items: 3, status: "delivered", total: "$45,100.00" },
  { id: "#ORD-7779", date: "Oct 23, 09:20", customer: "Stark Industries", items: 5, status: "processing", total: "$3,200.00" },
  { id: "#ORD-7778", date: "Oct 22, 18:00", customer: "Wayne Enterprises", items: 24, status: "delivered", total: "$112,050.00" },
  { id: "#ORD-7777", date: "Oct 22, 14:10", customer: "Oscorp Industries", items: 7, status: "shipped", total: "$6,340.00" },
  { id: "#ORD-7776", date: "Oct 21, 09:45", customer: "LexCorp Supply", items: 15, status: "delivered", total: "$28,750.00" },
  { id: "#ORD-7775", date: "Oct 20, 16:20", customer: "Umbrella Corp", items: 2, status: "processing", total: "$1,890.00" },
];

const summaryStats = [
  { label: "Total Orders", value: "2,847", icon: "receipt_long", trend: "+8.3%" },
  { label: "Pending Shipments", value: "34", icon: "local_shipping", trend: "-12%" },
  { label: "Revenue (MTD)", value: "$1.2M", icon: "payments", trend: "+15.4%" },
];

const tableHeaders = ["Order ID", "Date", "Customer", "Items", "Status", "Total Amount", "Actions"];

export default function Orders() {
  const [createOpen, setCreateOpen] = useState(false);

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
              Track, manage, and fulfill customer orders across your supply chain.
            </p>
          </div>
          <div className="flex gap-sm">
            <button className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="px-md py-sm border border-outline-variant rounded-lg text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs">
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

        {/* ── Info Banner ── */}
        <div className="mb-lg p-md bg-primary/5 border border-primary/20 rounded-xl text-sm text-on-surface-variant flex items-start gap-sm">
          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
          <div>
            <p className="font-medium text-on-surface">Backend Integration Note</p>
            <p className="mt-1">
              The orders table below uses mock data. The backend currently supports <code className="bg-surface-container px-1 rounded text-xs">POST /api/orders</code> (create order) but does not yet have a <code className="bg-surface-container px-1 rounded text-xs">GET /api/orders</code> endpoint to list orders. Click <strong>"New Order"</strong> above to place an order via the live API.
            </p>
          </div>
        </div>

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
              <span className="text-[11px] font-medium text-primary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                {stat.trend}
              </span>
            </div>
          ))}
        </div>

        {/* ── Orders Table ── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <p className="text-xs font-semibold text-on-surface-variant tracking-wider">
              Showing {ordersData.length} orders (mock data)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-on-surface-variant">Sort by:</span>
              <select className="bg-transparent border-none text-on-surface text-base font-semibold py-1 pl-2 pr-6 focus:ring-0 cursor-pointer">
                <option>Date (Newest First)</option>
                <option>Total (High to Low)</option>
                <option>Status</option>
              </select>
            </div>
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
                {ordersData.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container transition-colors duration-150 group">
                    <td className="px-md py-sm text-sm font-medium text-primary whitespace-nowrap">{order.id}</td>
                    <td className="px-md py-sm text-sm text-on-surface-variant whitespace-nowrap">{order.date}</td>
                    <td className="px-md py-sm text-sm text-on-surface font-medium">{order.customer}</td>
                    <td className="px-md py-sm text-sm text-on-surface-variant text-center tabular-nums">{order.items}</td>
                    <td className="px-md py-sm"><StatusBadge variant={order.status} /></td>
                    <td className="px-md py-sm text-sm text-on-surface text-right font-medium tabular-nums">{order.total}</td>
                    <td className="px-md py-sm text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-md py-sm border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
            <button className="text-on-surface-variant hover:text-primary text-xs font-semibold transition-colors disabled:opacity-50" disabled>Previous</button>
            <div className="flex gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                    page === 1 ? "bg-surface-container-highest text-on-surface" : "hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
            </div>
            <button className="text-on-surface hover:text-primary text-xs font-semibold transition-colors">Next</button>
          </div>
        </div>
      </main>

      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          // Would refetch orders if GET endpoint existed
        }}
      />
    </>
  );
}
