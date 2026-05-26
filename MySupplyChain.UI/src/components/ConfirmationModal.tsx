import Modal from "./Modal";
import { useState } from "react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  requireWord?: string;
  isDanger?: boolean;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  requireWord,
  isDanger = false,
}: ConfirmationModalProps) {
  const [inputWord, setInputWord] = useState("");

  const handleConfirm = () => {
    if (requireWord && inputWord !== requireWord) return;
    onConfirm();
    onClose();
    setInputWord("");
  };

  const isConfirmDisabled = requireWord ? inputWord !== requireWord : false;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-md">
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {message}
        </p>

        {requireWord && (
          <div className="space-y-sm">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Type <span className="text-error font-mono">{requireWord}</span> to confirm
            </label>
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder={requireWord}
              className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-md border-t border-outline-variant/30">
          <button
            onClick={onClose}
            className="px-md py-sm rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-md py-sm rounded-lg text-sm font-semibold transition-all shadow-sm ${
              isDanger
                ? "bg-error text-on-error hover:opacity-90 shadow-error/20"
                : "bg-primary text-on-primary hover:opacity-90 shadow-primary/20"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
