import Modal from "./Modal";
import { useState } from "react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (requireWord && inputWord !== requireWord) return;
    setIsProcessing(true);
    try {
      await onConfirm();
      setInputWord("");
      onClose();
    } catch {
      // Error handling is done by the caller; just stop the spinner
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setInputWord("");
    onClose();
  };

  const isConfirmDisabled = (requireWord ? inputWord !== requireWord : false) || isProcessing;

  return (
    <Modal open={open} onClose={handleClose} title={title}>
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
              disabled={isProcessing}
              className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-md border-t border-outline-variant/30">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-md py-sm rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-md py-sm rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2 ${
              isDanger
                ? "bg-error text-on-error hover:opacity-90 shadow-error/20"
                : "bg-primary text-on-primary hover:opacity-90 shadow-primary/20"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
