import { useState, useRef } from "react";
import Modal from "./Modal";
import Papa from "papaparse";
import { salesHistories } from "../lib/api";
import type { ImportSummaryDto } from "../types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportCsvModal({ open, onClose, onImported }: Props) {
  const [step, setStep] = useState<"upload" | "map" | "summary">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping state
  const [skuCol, setSkuCol] = useState("");
  const [dateCol, setDateCol] = useState("");
  const [qtyCol, setQtyCol] = useState("");

  const [summary, setSummary] = useState<ImportSummaryDto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    // Parse just the first few lines to get headers
    Papa.parse(f, {
      header: true,
      preview: 1,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setHeaders(results.meta.fields);
          
          // Auto-guess mappings if possible
          const skuMatch = results.meta.fields.find(f => ["sku", "item", "productid"].includes(f.toLowerCase()));
          const dateMatch = results.meta.fields.find(f => ["date", "timestamp"].includes(f.toLowerCase()));
          const qtyMatch = results.meta.fields.find(f => ["quantity", "qty", "sales", "quantitysold"].includes(f.toLowerCase()));

          if (skuMatch) setSkuCol(skuMatch);
          if (dateMatch) setDateCol(dateMatch);
          if (qtyMatch) setQtyCol(qtyMatch);

          setStep("map");
        } else {
          setError("Could not parse headers from CSV. Please ensure it has a header row.");
        }
      },
      error: (err) => {
        setError("Error parsing CSV: " + err.message);
      }
    });
  };

  const handleImport = async () => {
    if (!file || !skuCol || !dateCol || !qtyCol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await salesHistories.import(file, skuCol, dateCol, qtyCol);
      setSummary(res);
      setStep("summary");
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setHeaders([]);
    setSkuCol("");
    setDateCol("");
    setQtyCol("");
    setSummary(null);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Historical Data">
      {error && (
        <div className="mb-md p-md bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-xs">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <p>{error}</p>
        </div>
      )}

      {step === "upload" && (
        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant">
            Upload a CSV file containing your historical sales or demand data. This data will be used by the ML engine to generate accurate forecasts.
          </p>
          <div 
            className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined text-[48px] text-primary mb-4">upload_file</span>
            <p className="text-base font-semibold text-on-surface mb-1">Click to select a CSV file</p>
            <p className="text-sm text-on-surface-variant">or drag and drop it here</p>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {step === "map" && (
        <div className="space-y-6">
          <div className="p-md bg-surface-container rounded-xl text-sm text-on-surface">
            <span className="font-semibold block mb-1">File Selected:</span>
            <span className="text-on-surface-variant">{file?.name}</span>
          </div>

          <p className="text-sm text-on-surface-variant">
            Please map your CSV columns to the required fields below. Any extra columns in your CSV will automatically be saved as additional data for ML feature engineering.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">SKU / Item Identifier *</label>
              <select className="w-full px-lg py-md rounded-xl bg-surface border border-outline-variant text-on-surface text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" value={skuCol} onChange={e => setSkuCol(e.target.value)}>
                <option value="">Select column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Date / Timestamp *</label>
              <select className="w-full px-lg py-md rounded-xl bg-surface border border-outline-variant text-on-surface text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" value={dateCol} onChange={e => setDateCol(e.target.value)}>
                <option value="">Select column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Quantity Sold *</label>
              <select className="w-full px-lg py-md rounded-xl bg-surface border border-outline-variant text-on-surface text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" value={qtyCol} onChange={e => setQtyCol(e.target.value)}>
                <option value="">Select column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-sm border-t border-outline-variant">
            <button
              onClick={() => setStep("upload")}
              className="px-6 py-2.5 border border-outline-variant text-on-surface rounded-xl text-base font-semibold hover:bg-surface-container-high transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !skuCol || !dateCol || !qtyCol}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-base font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
              Import Data
            </button>
          </div>
        </div>
      )}

      {step === "summary" && summary && (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-primary">check_circle</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface">Import Successful</h3>
          
          <div className="bg-surface-container rounded-xl p-md text-left space-y-3 mx-auto max-w-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Records Imported:</span>
              <span className="text-base font-bold text-on-surface">{summary.recordsImported}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">New Products Created:</span>
              <span className="text-base font-bold text-on-surface">{summary.newProductsCreated}</span>
            </div>
          </div>

          {summary.newProductsCreated > 0 && (
            <div className="bg-secondary-container/30 border border-secondary/20 p-md rounded-xl text-sm text-on-surface-variant text-left flex gap-xs items-start">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
              <p>
                We noticed <strong>{summary.newProductsCreated}</strong> SKUs in your CSV that did not exist in our system. We have automatically created base products for them with 0 stock so your sales data is preserved and ready for trend analysis!
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-outline-variant">
            <button
              onClick={handleClose}
              className="w-full px-6 py-2.5 bg-primary text-on-primary rounded-xl text-base font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
