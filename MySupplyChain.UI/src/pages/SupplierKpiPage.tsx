import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import Topbar from "../components/Topbar";
import { suppliers } from "../lib/api";
import type { SupplierKpiDto } from "../types/api";

// ── Helpers ────────────────────────────────────────────────────────────────



function onTimeBadge(pct: number | null): string {
  if (pct === null) return "bg-surface-container-highest text-on-surface-variant";
  if (pct >= 90) return "bg-green-500/15 text-green-400";
  if (pct >= 70) return "bg-yellow-500/15 text-yellow-400";
  return "bg-error/15 text-error";
}

function leadTimeDelta(actual: number | null, promised: number): string | null {
  if (actual === null) return null;
  const delta = actual - promised;
  if (delta === 0) return "On target";
  return delta > 0 ? `+${delta}d over` : `${Math.abs(delta)}d under`;
}

function leadTimeDeltaColor(actual: number | null, promised: number): string {
  if (actual === null) return "";
  const delta = actual - promised;
  if (delta <= 0) return "text-green-400";
  if (delta <= 2) return "text-yellow-400";
  return "text-error";
}

// ── Summary stat card ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
}

function StatCard({ icon, label, value, subtitle, color = "text-primary" }: StatCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl p-lg flex items-start gap-md border border-outline-variant/30">
      <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-primary-container filled text-xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-2xl font-bold tracking-tight leading-none ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function SupplierKpiPage() {
  const { onOpenSupport, onOpenSettings } = useOutletContext<{
    onOpenSupport: () => void;
    onOpenSettings: () => void;
  }>();

  const [data, setData] = useState<SupplierKpiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await suppliers.getKpi();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load supplier KPIs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  // ── Derived summary stats ─────────────────────────────────────────────────

  const activeSupplierCount = data.length;
  const suppliersWithData = data.filter((s) => s.totalOrdersReceived > 0);
  const overallOnTime =
    suppliersWithData.length > 0
      ? (
          suppliersWithData.reduce((sum, s) => sum + (s.onTimePercentage ?? 0), 0) /
          suppliersWithData.length
        ).toFixed(1)
      : null;
  const totalOrders = data.reduce((sum, s) => sum + s.totalOrdersReceived, 0);

  return (
    <>
      <Topbar
        showSearch
        searchPlaceholder="Search suppliers..."
        onOpenSupport={onOpenSupport}
        onOpenSettings={onOpenSettings}
      />

      <main className="flex-1 overflow-y-auto p-margin-desktop relative font-['Outfit']">
        {/* ── Page Header ── */}
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="text-[32px] leading-10 font-bold text-on-surface tracking-tight mb-1">
              Supplier Lead Time KPI
            </h2>
            <p className="text-base text-on-surface-variant">
              {loading
                ? "Loading KPI data..."
                : `${activeSupplierCount} active suppliers · ${totalOrders} orders tracked`}
            </p>
          </div>
          <button
            id="refresh-kpi-btn"
            onClick={fetchKpi}
            disabled={loading}
            className="flex items-center gap-sm bg-surface-container border border-outline-variant/40 text-on-surface-variant px-md py-sm rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            Refresh
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-lg">
          <StatCard
            icon="groups"
            label="Active Suppliers"
            value={activeSupplierCount.toString()}
            subtitle="Currently enabled"
          />
          <StatCard
            icon="local_shipping"
            label="Total Orders Received"
            value={totalOrders.toLocaleString()}
            subtitle="With lead time data"
          />
          <StatCard
            icon="verified"
            label="Avg On-Time Rate"
            value={overallOnTime !== null ? `${overallOnTime}%` : "—"}
            subtitle={suppliersWithData.length > 0 ? "Across all suppliers" : "No data yet"}
            color={
              overallOnTime === null
                ? "text-on-surface-variant"
                : Number(overallOnTime) >= 90
                ? "text-green-400"
                : Number(overallOnTime) >= 70
                ? "text-yellow-400"
                : "text-error"
            }
          />
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="flex items-start gap-sm bg-error/10 border border-error/30 rounded-xl px-md py-sm mb-lg">
            <span className="material-symbols-outlined text-error text-xl">error</span>
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* ── KPI Table ── */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface text-sm tracking-wide">Supplier Performance</h3>
            <span className="text-xs text-on-surface-variant font-medium">
              {suppliersWithData.length} / {activeSupplierCount} have received orders
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              <span className="text-sm font-medium">Loading supplier data...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-30">local_shipping</span>
              <p className="text-sm font-medium">No active suppliers found</p>
              <p className="text-xs opacity-60">Suppliers will appear here once added to the system</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" id="supplier-kpi-table">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left px-lg py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Supplier
                    </th>
                    <th className="text-center px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Promised Lead Time
                    </th>
                    <th className="text-center px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Avg Actual Lead Time
                    </th>
                    <th className="text-center px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Variance
                    </th>
                    <th className="text-center px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      On-Time Rate
                    </th>
                    <th className="text-center px-md py-sm text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Orders Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((supplier) => {
                    const delta = leadTimeDelta(supplier.avgActualLeadTimeDays, supplier.promisedLeadTimeDays);
                    const deltaColor = leadTimeDeltaColor(
                      supplier.avgActualLeadTimeDays,
                      supplier.promisedLeadTimeDays
                    );

                    return (
                      <tr
                        key={supplier.supplierId}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-highest/50 transition-colors"
                      >
                        {/* Supplier name + email hint */}
                        <td className="px-lg py-md">
                          <div className="flex items-center gap-sm">
                            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-on-primary-container text-base">
                                storefront
                              </span>
                            </div>
                            <span className="font-semibold text-on-surface">{supplier.supplierName}</span>
                          </div>
                        </td>

                        {/* Promised */}
                        <td className="px-md py-md text-center">
                          <span className="font-semibold text-on-surface">
                            {supplier.promisedLeadTimeDays}d
                          </span>
                        </td>

                        {/* Actual */}
                        <td className="px-md py-md text-center">
                          {supplier.avgActualLeadTimeDays !== null ? (
                            <span className="font-semibold text-on-surface">
                              {supplier.avgActualLeadTimeDays}d
                            </span>
                          ) : (
                            <span className="text-on-surface-variant text-xs">No data yet</span>
                          )}
                        </td>

                        {/* Variance */}
                        <td className="px-md py-md text-center">
                          {delta ? (
                            <span className={`text-xs font-semibold ${deltaColor}`}>{delta}</span>
                          ) : (
                            <span className="text-on-surface-variant text-xs">—</span>
                          )}
                        </td>

                        {/* On-time badge */}
                        <td className="px-md py-md text-center">
                          {supplier.onTimePercentage !== null ? (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${onTimeBadge(
                                supplier.onTimePercentage
                              )}`}
                            >
                              {supplier.onTimePercentage}%
                            </span>
                          ) : (
                            <span className="text-on-surface-variant text-xs">—</span>
                          )}
                        </td>

                        {/* Orders count */}
                        <td className="px-md py-md text-center">
                          <span
                            className={
                              supplier.totalOrdersReceived > 0
                                ? "font-semibold text-on-surface"
                                : "text-on-surface-variant text-xs"
                            }
                          >
                            {supplier.totalOrdersReceived > 0
                              ? supplier.totalOrdersReceived.toLocaleString()
                              : "None yet"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Developer Note ── */}
        <p className="mt-md text-xs text-on-surface-variant/50 text-center">
          Lead time data is recorded automatically when an order&apos;s status is updated to{" "}
          <span className="font-semibold">Delivered</span>.
        </p>
      </main>
    </>
  );
}
