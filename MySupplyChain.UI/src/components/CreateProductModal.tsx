import { useState } from "react";
import Modal from "../components/Modal";
import { products } from "../lib/api";
import type { CreateProductRequest } from "../types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm: CreateProductRequest = {
  name: "",
  sku: "",
  price: 0,
  currentStock: 0,
  reorderPoint: 0,
};

export default function CreateProductModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await products.create(form);
      setForm(emptyForm);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-outline shadow-sm";

  return (
    <Modal open={open} onClose={onClose} title="Add Product">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
            Product Name
          </label>
          <input
            className={inputClass}
            placeholder="Industrial Bearing #XB-902"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
              SKU
            </label>
            <input
              className={inputClass}
              placeholder="SKU-1023"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
              Price ($)
            </label>
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
              value={form.price || ""}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
              Initial Stock
            </label>
            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="4250"
              value={form.currentStock || ""}
              onChange={(e) => setForm({ ...form, currentStock: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
              Reorder Point
            </label>
            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="1000"
              value={form.reorderPoint || ""}
              onChange={(e) => setForm({ ...form, reorderPoint: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-error bg-error-container/10 border border-error/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-md pt-4 border-t border-outline-variant/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-outline-variant rounded-xl text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
