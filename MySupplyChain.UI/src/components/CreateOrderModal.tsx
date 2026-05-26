import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { orders, products as productsApi } from "../lib/api";
import type { ProductDto } from "../types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** If provided, pre-selects this product */
  preselectedProductId?: number;
}

export default function CreateOrderModal({ open, onClose, onCreated, preselectedProductId }: Props) {
  const [productsList, setProductsList] = useState<ProductDto[]>([]);
  const [productId, setProductId] = useState<number>(preselectedProductId ?? 0);
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      productsApi.getAll().then(setProductsList).catch(() => {});
      if (preselectedProductId) setProductId(preselectedProductId);
    }
  }, [open, preselectedProductId]);

  const selectedProduct = productsList.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId <= 0 || quantity <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await orders.create({ productId, quantity });
      setQuantity(0);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-sm";

  return (
    <Modal open={open} onClose={onClose} title="Create New Order">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
            Product
          </label>
          <select
            className={inputClass}
            value={productId}
            onChange={(e) => setProductId(parseInt(e.target.value))}
            required
          >
            <option value={0}>Select a product...</option>
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name} (Stock: {p.currentStock.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-on-surface-variant shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-on-surface">Available Stock</span>
              <span className="text-on-surface font-bold text-base">
                {selectedProduct.currentStock.toLocaleString()} units
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-on-surface">Unit Price</span>
              <span className="text-on-surface font-bold text-base">
                ${selectedProduct.price.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2 tracking-wide">
            Quantity
          </label>
          <input
            className={inputClass}
            type="number"
            min="1"
            max={selectedProduct?.currentStock}
            placeholder="100"
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
            disabled={loading || productId <= 0 || quantity <= 0}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
