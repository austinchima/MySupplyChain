import { useState, useRef } from "react";
import Modal from "./Modal";
import { salesHistories } from "../lib/api";
import type { ImportSummaryDto } from "../types/api";

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (summary: ImportSummaryDto) => void;
}

export default function CsvImportModal({ open, onClose, onImportSuccess }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowsPreview, setRowsPreview] = useState<string[][]>([]);
  const [skuColumn, setSkuColumn] = useState<string>("");
  const [dateColumn, setDateColumn] = useState<string>("");
  const [quantityColumn, setQuantityColumn] = useState<string>("");

  // New advanced mappings
  const [productNameColumn, setProductNameColumn] = useState<string>("");
  const [productPriceColumn, setProductPriceColumn] = useState<string>("");
  const [customerEmailColumn, setCustomerEmailColumn] = useState<string>("");
  const [customerNameColumn, setCustomerNameColumn] = useState<string>("");
  const [orderIdColumn, setOrderIdColumn] = useState<string>("");

  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_ROW_COUNT = 100_000;
  const ALLOWED_MIME_TYPES = ["text/csv", "application/vnd.ms-excel", "text/plain"];

  // Parse CSV headers and first few rows for preview
  const handleFileChange = (selectedFile: File) => {
    // 1. File size check
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
      return;
    }

    // 2. MIME type + extension check
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid .csv file.");
      return;
    }

    // 3. Extension check
    if (!selectedFile.name.endsWith(".csv")) {
      setError("File must have a .csv extension.");
      return;
    }

    // 4. Filename sanitization (no path traversal)
    if (selectedFile.name.includes("/") || selectedFile.name.includes("\\") || selectedFile.name.includes("..")) {
      setError("Invalid filename.");
      return;
    }

    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

      // 5. Row count limit
      if (lines.length > MAX_ROW_COUNT) {
        setError(`CSV contains too many rows (${lines.length.toLocaleString()}). Maximum is ${MAX_ROW_COUNT.toLocaleString()}.`);
        setFile(null);
        return;
      }

      if (lines.length === 0) {
        setError("The uploaded CSV file is empty.");
        return;
      }

      // Safe CSV line parsing (handles quotes)
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const parsedHeaders = parseCsvLine(lines[0]);
      setHeaders(parsedHeaders);

      const parsedRows = lines.slice(1, 4).map(line => parseCsvLine(line));
      setRowsPreview(parsedRows);

      // Smart auto-detect mapping
      const findBestMatch = (candidates: string[], searchTerms: string[]): string => {
        for (const term of searchTerms) {
          const match = candidates.find(h => h.toLowerCase().includes(term));
          if (match) return match;
        }
        return candidates[0] || "";
      };

      setSkuColumn(findBestMatch(parsedHeaders, ["sku", "product", "item", "code", "id"]));
      setDateColumn(findBestMatch(parsedHeaders, ["date", "time", "created", "timestamp", "day"]));
      setQuantityColumn(findBestMatch(parsedHeaders, ["qty", "quantity", "sold", "count", "shipped"]));

      setProductNameColumn(findBestMatch(parsedHeaders, ["name", "title", "description"]));
      setProductPriceColumn(findBestMatch(parsedHeaders, ["price", "cost", "value", "msrp", "rate"]));
      setCustomerEmailColumn(findBestMatch(parsedHeaders, ["email", "contact", "user"]));
      setCustomerNameColumn(findBestMatch(parsedHeaders, ["customer", "client", "buyer", "full name"]));
      setOrderIdColumn(findBestMatch(parsedHeaders, ["order", "transaction", "invoice", "ref"]));
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setRowsPreview([]);
    setSkuColumn("");
    setDateColumn("");
    setQuantityColumn("");
    setProductNameColumn("");
    setProductPriceColumn("");
    setCustomerEmailColumn("");
    setCustomerNameColumn("");
    setOrderIdColumn("");
    setError(null);
    setImporting(false);
  };

  const handleImportSubmit = async () => {
    if (!file || !skuColumn || !dateColumn || !quantityColumn) {
      setError("Please map the required SKU, Date, and Quantity columns before importing.");
      return;
    }

    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append("File", file);
    formData.append("SkuColumn", skuColumn);
    formData.append("DateColumn", dateColumn);
    formData.append("QuantityColumn", quantityColumn);

    if (productNameColumn) formData.append("ProductNameColumn", productNameColumn);
    if (productPriceColumn) formData.append("ProductPriceColumn", productPriceColumn);
    if (customerEmailColumn) formData.append("CustomerEmailColumn", customerEmailColumn);
    if (customerNameColumn) formData.append("CustomerNameColumn", customerNameColumn);
    if (orderIdColumn) formData.append("OrderIdColumn", orderIdColumn);

    try {
      const summary = await salesHistories.import(formData);
      onImportSuccess(summary);
      onClose();
      handleReset();
    } catch (err: any) {
      console.error("CSV Import Failed:", err);
      setError(err.message || "Failed to process CSV file on backend. Please ensure the dates and quantities are valid.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Import Messy Sales History CSV">
      <div className="space-y-lg max-h-[80vh] overflow-y-auto pr-1">
        {/* Error Alert */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-4 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          /* Step 1: Drag & Drop Ingestion */
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className="border-2 border-dashed border-outline-variant/60 hover:border-primary/50 rounded-2xl p-10 text-center bg-surface-container-low hover:bg-surface-container/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-md"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              accept=".csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[32px]">upload_file</span>
            </div>
            <div className="space-y-xs">
              <p className="font-bold text-on-surface text-base">Drag & drop your sales CSV here</p>
              <p className="text-xs text-on-surface-variant">or click to browse your computer</p>
            </div>
            <p className="text-[10px] text-outline font-medium max-w-[280px]">
              Upload any raw spreadsheet from QuickBooks, Shopify, or Excel. We will map your headers in the next step.
            </p>
          </div>
        ) : (
          /* Step 2: In-Context Header Column-Mapping Dialog */
          <div className="space-y-lg">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-surface-container-high/40 border border-outline-variant/30 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">csv</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">{file.name}</p>
                  <p className="text-xs text-on-surface-variant">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-error hover:bg-error/10 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Reset File
              </button>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 space-y-md">
              <h4 className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary">schema</span>
                Map CSV Columns to System Properties
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Since real-world spreadsheets are messy and use custom headers, select which column in your CSV matches each system field below:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-md pt-2">
                {/* SKU mapping */}
                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Product SKU
                  </label>
                  <select
                    value={skuColumn}
                    onChange={(e) => setSkuColumn(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Date mapping */}
                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Sales Date
                  </label>
                  <select
                    value={dateColumn}
                    onChange={(e) => setDateColumn(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity mapping */}
                <div className="space-y-sm">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    Quantity Sold
                  </label>
                  <select
                    value={quantityColumn}
                    onChange={(e) => setQuantityColumn(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced Mapping Section */}
              <div className="pt-4 space-y-md">
                <h5 className="text-[10px] font-bold text-outline uppercase tracking-wider flex items-center gap-2">
                  Advanced Mappings (Optional)
                  <div className="h-px flex-1 bg-outline-variant/30"></div>
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  {/* Product Name */}
                  <div className="space-y-sm">
                    <label className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                      Product Name
                    </label>
                    <select
                      value={productNameColumn}
                      onChange={(e) => setProductNameColumn(e.target.value)}
                      className="w-full bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-lg p-2 text-[11px] outline-none"
                    >
                      <option value="">— Skip (Use SKU) —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Price */}
                  <div className="space-y-sm">
                    <label className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                      Unit Price
                    </label>
                    <select
                      value={productPriceColumn}
                      onChange={(e) => setProductPriceColumn(e.target.value)}
                      className="w-full bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-lg p-2 text-[11px] outline-none"
                    >
                      <option value="">— Skip (Use 0) —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Order ID */}
                  <div className="space-y-sm">
                    <label className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                      Order / Invoice ID
                    </label>
                    <select
                      value={orderIdColumn}
                      onChange={(e) => setOrderIdColumn(e.target.value)}
                      className="w-full bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-lg p-2 text-[11px] outline-none"
                    >
                      <option value="">— Skip (No Grouping) —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Email */}
                  <div className="space-y-sm">
                    <label className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                      Customer Email
                    </label>
                    <select
                      value={customerEmailColumn}
                      onChange={(e) => setCustomerEmailColumn(e.target.value)}
                      className="w-full bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-lg p-2 text-[11px] outline-none"
                    >
                      <option value="">— Skip (Anonymous) —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-sm">
                    <label className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                      Customer Name
                    </label>
                    <select
                      value={customerNameColumn}
                      onChange={(e) => setCustomerNameColumn(e.target.value)}
                      className="w-full bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-lg p-2 text-[11px] outline-none"
                    >
                      <option value="">— Skip —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Context Mapped Preview Grid */}
            <div className="space-y-sm">
              <h4 className="text-xs font-bold text-on-surface-variant pl-1">Live Ingestion Preview (First 3 Rows)</h4>
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/30 font-semibold">
                      <th className="p-3">Row</th>
                      <th className="p-3 text-primary">SKU</th>
                      <th className="p-3 text-on-surface">Product Name</th>
                      <th className="p-3 text-on-surface text-right">Price</th>
                      <th className="p-3 text-secondary">Date</th>
                      <th className="p-3 text-tertiary">Qty</th>
                      <th className="p-3 text-outline">Order ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsPreview.map((row, index) => {
                      const skuIndex = headers.indexOf(skuColumn);
                      const nameIndex = headers.indexOf(productNameColumn);
                      const priceIndex = headers.indexOf(productPriceColumn);
                      const dateIndex = headers.indexOf(dateColumn);
                      const qtyIndex = headers.indexOf(quantityColumn);
                      const orderIndex = headers.indexOf(orderIdColumn);

                      return (
                        <tr key={index} className="border-b border-outline-variant/20 hover:bg-surface-container-high/20 transition-colors">
                          <td className="p-3 text-outline">#{index + 1}</td>
                          <td className="p-3 font-semibold text-on-surface font-mono">{skuIndex >= 0 ? row[skuIndex] : "—"}</td>
                          <td className="p-3 text-on-surface-variant truncate max-w-[120px]">{nameIndex >= 0 ? row[nameIndex] : "—"}</td>
                          <td className="p-3 text-on-surface text-right">{priceIndex >= 0 ? `$${row[priceIndex]}` : "—"}</td>
                          <td className="p-3 text-on-surface-variant">{dateIndex >= 0 ? row[dateIndex] : "—"}</td>
                          <td className="p-3 font-semibold text-on-surface">{qtyIndex >= 0 ? row[qtyIndex] : "—"}</td>
                          <td className="p-3 text-outline truncate max-w-[80px]">{orderIndex >= 0 ? row[orderIndex] : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-md border-t border-outline-variant/20">
              <button
                onClick={onClose}
                className="bg-transparent hover:bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-on-surface text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={importing}
                className="bg-primary hover:bg-primary-container text-on-primary-container disabled:opacity-50 text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/25 cursor-pointer flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Processing Stream...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    Confirm & Stream Import
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
