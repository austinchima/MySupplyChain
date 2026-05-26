import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Topbar from "../components/Topbar";
import RestockModal from "../components/RestockModal";
import { products as productsApi } from "../lib/api";
import type { ProductDto, ProductForecastDto } from "../types/api";

export default function AIDemandForecastingDetail() {
  const [searchParams] = useSearchParams();
  const productIdParam = parseInt(searchParams.get("productId") ?? "0");

  const [productsList, setProductsList] = useState<ProductDto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(productIdParam);
  const [forecast, setForecast] = useState<ProductForecastDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restockOpen, setRestockOpen] = useState(false);

  // Fetch product list for the selector
  useEffect(() => {
    productsApi.getAll().then((data) => {
      setProductsList(data);
      if (!selectedProductId && data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    });
  }, [selectedProductId]);

  const selectedProduct = productsList.find((p) => p.id === selectedProductId);

  const fetchForecast = useCallback(async () => {
    if (!selectedProductId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await productsApi.getForecast(selectedProductId, 30);
      setForecast(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forecast");
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  // Build SVG chart path from forecastedUnits
  const buildForecastChart = () => {
    if (!forecast || forecast.forecastedUnits.length === 0) return null;

    const units = forecast.forecastedUnits;
    const lower = forecast.lowerBound;
    const upper = forecast.upperBound;
    const maxVal = Math.max(...units, ...upper, 1);
    const chartW = 900;
    const chartH = 250;
    const padL = 50;
    const padT = 20;

    const toX = (i: number) => padL + (i / (units.length - 1)) * chartW;
    const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;

    const forecastPath = units.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");

    // Confidence interval polygon
    let ciPath = "";
    if (lower.length > 0 && upper.length > 0) {
      const topPoints = upper.map((v, i) => `${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" L ");
      const botPoints = [...lower].reverse().map((v, i) => `${toX(lower.length - 1 - i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" L ");
      ciPath = `M ${topPoints} L ${botPoints} Z`;
    }

    // Y-axis labels
    const yLabels = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
      y: padT + chartH - frac * chartH,
      label: Math.round(frac * maxVal).toLocaleString(),
    }));

    return (
      <svg className="absolute inset-0" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${padL + chartW + 20} ${padT + chartH + 40}`} width="100%">
        {/* Grid lines */}
        {yLabels.map(({ y }) => (
          <line key={y} className="chart-grid-line" x1={padL} x2={padL + chartW} y1={y} y2={y} />
        ))}
        {/* Y-axis labels */}
        {yLabels.map(({ y, label }) => (
          <text key={label} className="chart-axis-label" textAnchor="end" x={padL - 8} y={y + 4}>{label}</text>
        ))}
        {/* X-axis labels */}
        {[0, Math.floor(units.length / 4), Math.floor(units.length / 2), Math.floor(3 * units.length / 4), units.length - 1].map((i) => (
          <text key={i} className="chart-axis-label" textAnchor="middle" x={toX(i)} y={padT + chartH + 20}>Day {i + 1}</text>
        ))}
        {/* Confidence interval */}
        {ciPath && <path d={ciPath} fill="#afc6ff" opacity="0.12" />}
        {/* Forecast line */}
        <path d={forecastPath} fill="none" stroke="#afc6ff" strokeWidth="2.5" />
        {/* Start marker */}
        <circle cx={toX(0)} cy={toY(units[0])} fill="#16191E" r="4" stroke="#afc6ff" strokeWidth="2" />
      </svg>
    );
  };

  const capacityPct = selectedProduct
    ? Math.min(100, Math.round((selectedProduct.currentStock / Math.max(selectedProduct.reorderPoint * 5, 1)) * 100))
    : 0;

  return (
    <>
      <Topbar
        title="Demand Forecasting"
        subtitle={selectedProduct?.name}
      />

      <div className="flex-1 overflow-y-auto p-md md:p-lg space-y-md md:space-y-lg">
        {/* ── Product Selector ── */}
        <div className="flex items-center gap-md">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Product:
          </label>
          <select
            className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
          >
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
          {loading && (
            <span className="material-symbols-outlined text-[20px] animate-spin text-primary">
              progress_activity
            </span>
          )}
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="p-md bg-error-container/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button onClick={fetchForecast} className="ml-auto text-xs font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Hero: Forecast Chart ── */}
        <section className="glass-card rounded-2xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary filled">
                analytics
              </span>
              AI Forecast
              {forecast && (
                <span className="text-xs font-normal text-outline ml-2">
                  ({forecast.horizon}-day horizon · RMSE: {forecast.rmse.toFixed(2)} · MAE: {forecast.mae.toFixed(2)})
                </span>
              )}
            </h3>
          </div>

          {/* Chart Legend */}
          <div className="flex gap-lg mb-md px-md flex-wrap">
            <div className="flex items-center gap-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[11px] font-medium text-outline">Forecasted Demand</span>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-3 h-3 rounded bg-primary opacity-20" />
              <span className="text-[11px] font-medium text-outline">95% Confidence Interval</span>
            </div>
            {forecast && (
              <div className="flex items-center gap-sm ml-auto">
                <span className="text-[11px] font-medium text-outline">
                  Total Predicted Demand:
                </span>
                <span className="text-sm font-bold text-primary">
                  {forecast.totalPredictedDemand.toLocaleString()} units
                </span>
              </div>
            )}
          </div>

          {/* SVG Chart */}
          <div className="flex-1 w-full relative min-h-[300px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] animate-spin mr-3">progress_activity</span>
                Generating AI forecast...
              </div>
            ) : forecast ? (
              buildForecastChart()
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm">
                Select a product to view its demand forecast.
              </div>
            )}
          </div>
        </section>

        {/* ── Bottom Split Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
          {/* Inventory Metrics */}
          <section className="glass-card rounded-2xl p-md flex flex-col gap-md">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold text-on-surface">Current Inventory Metrics</h3>
              {selectedProduct && (
                <span
                  className={`px-sm py-0.5 rounded text-[11px] font-medium border ${
                    selectedProduct.healthStatus === "Low Stock"
                      ? "bg-error/20 text-error border-error/30"
                      : "bg-secondary-container/20 text-secondary border-secondary/30"
                  }`}
                >
                  {selectedProduct.healthStatus}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-md mt-sm">
              <div className="flex flex-col gap-xs">
                <span className="text-[11px] font-medium text-outline uppercase tracking-wider">Current Stock</span>
                <span className="text-[32px] leading-10 font-bold text-on-surface tracking-tight">
                  {selectedProduct?.currentStock.toLocaleString() ?? "—"}
                  <span className="text-base text-outline ml-1 font-normal">units</span>
                </span>
              </div>
              <div className="flex flex-col gap-xs border-l border-outline-variant pl-md">
                <span className="text-[11px] font-medium text-outline uppercase tracking-wider">Reorder Point</span>
                <span className="text-[32px] leading-10 font-bold text-on-surface tracking-tight">
                  {selectedProduct?.reorderPoint.toLocaleString() ?? "—"}
                  <span className="text-base text-outline ml-1 font-normal">units</span>
                </span>
              </div>
            </div>
            {/* Depletion Gauge */}
            <div className="mt-md space-y-sm">
              <div className="flex justify-between text-[11px] font-medium text-outline">
                <span>Capacity</span>
                <span>{capacityPct}%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${capacityPct < 30 ? "bg-error" : "bg-secondary"}`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="glass-card rounded-2xl p-md flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-on-surface mb-sm">Quick Actions</h3>
              <p className="text-sm text-outline mb-md">
                {forecast?.recommendation ?? "Select a product and generate a forecast to see AI recommendations."}
              </p>
              {forecast && (
                <div className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 mb-md ${
                  forecast.shouldReorder
                    ? "bg-error/10 border-error/30 text-error"
                    : "bg-secondary/10 border-secondary/30 text-secondary"
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {forecast.shouldReorder ? "warning" : "check_circle"}
                  </span>
                  {forecast.shouldReorder ? "Reorder recommended" : "No reorder needed"}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-sm">
              <button
                onClick={() => setRestockOpen(true)}
                disabled={!selectedProduct}
                className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 rounded py-sm px-md text-base font-semibold flex justify-center items-center gap-sm shadow-[0px_4px_20px_rgba(82,141,255,0.15)] disabled:opacity-50"
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Restock Now
              </button>
              <div className="grid grid-cols-2 gap-sm mt-xs">
                <button className="w-full border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors duration-200 rounded py-sm px-sm text-xs font-semibold flex justify-center items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Adjust Reorder Point
                </button>
                <button
                  onClick={() => {
                    if (!forecast) return;
                    const csv = [
                      "Day,Forecast,Lower95,Upper95",
                      ...forecast.forecastedUnits.map((v, i) =>
                        `${i + 1},${v.toFixed(2)},${forecast.lowerBound[i]?.toFixed(2) ?? ""},${forecast.upperBound[i]?.toFixed(2) ?? ""}`
                      ),
                    ].join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `forecast_${selectedProduct?.sku ?? "data"}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!forecast}
                  className="w-full border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors duration-200 rounded py-sm px-sm text-xs font-semibold flex justify-center items-center gap-1 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export Forecast Data
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="h-lg" />
      </div>

      {/* Restock Modal */}
      {selectedProduct && (
        <RestockModal
          open={restockOpen}
          onClose={() => setRestockOpen(false)}
          onRestocked={() => {
            fetchForecast();
            productsApi.getAll().then(setProductsList);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          currentStock={selectedProduct.currentStock}
        />
      )}
    </>
  );
}
