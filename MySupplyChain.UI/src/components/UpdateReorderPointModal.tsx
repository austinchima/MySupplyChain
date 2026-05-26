import Modal from "./Modal";
import { useState, useEffect } from "react";
import { products } from "../lib/api";

interface UpdateReorderPointModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  productId: number;
  productName: string;
  currentValue: number;
}

export default function UpdateReorderPointModal({
  open,
  onClose,
  onUpdated,
  productId,
  productName,
  currentValue,
}: UpdateReorderPointModalProps) {
  const [newValue, setNewValue] = useState(currentValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNewValue(currentValue);
  }, [currentValue, open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await products.update(productId, { id: productId, reorderPoint: newValue });
      onUpdated();
      onClose();
    } catch (err) {
      alert("Failed to update reorder point.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Reorder Point">
      <form onSubmit={handleSave} className="space-y-md">
        <div className="p-md bg-primary-container/10 border border-primary/20 rounded-2xl flex items-center gap-md">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">tune</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Product</p>
            <p className="text-sm font-bold text-on-surface">{productName}</p>
          </div>
        </div>

        <div className="space-y-sm">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              New Reorder Threshold
            </label>
            <span className="text-xs font-mono text-primary font-bold">{newValue} units</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="5"
            value={newValue}
            onChange={(e) => setNewValue(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-outline font-bold uppercase">
            <span>Critical (0)</span>
            <span>Optimized</span>
            <span>Bulk (1000)</span>
          </div>
        </div>

        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">info</span>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            The reorder point triggers an automated alert when stock drops below this level. 
            AI forecasting suggests a value of <span className="font-bold text-secondary">25 units</span> based on current volatility.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-md border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-md py-sm rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-lg py-sm rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
               <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
               <span className="material-symbols-outlined text-sm">check</span>
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </Modal>
  );
}
