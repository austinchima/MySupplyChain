import { useState } from "react";
import Modal from "../components/Modal";
import { products } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onRestocked: () => void;
  productId: number;
  productName: string;
  currentStock: number;
}

export default function RestockModal({ open, onClose, onRestocked, productId, productName, currentStock }: Props) {
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await products.restock(productId, { productId, quantity });
      setQuantity(0);
      onRestocked();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restock product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Restock Product">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm">
          <p className="text-base font-bold text-on-surface mb-2">{productName}</p>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-on-surface-variant">Current Stock</span>
            <span className="text-on-surface font-bold text-base">{currentStock.toLocaleString()} units</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
            Quantity to Add
          </label>
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-outline shadow-sm"
            type="number"
            min="1"
            placeholder="500"
            value={quantity || ""}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            required
          />
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
            disabled={loading || quantity <= 0}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
            {loading ? "Restocking..." : "Confirm Restock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
