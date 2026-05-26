import Modal from "./Modal";
import { useState } from "react";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:austinchima515@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Contact Support">
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="space-y-sm">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What do you need help with?"
            className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-sm">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Message
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or feedback..."
            className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
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
            className="bg-primary text-on-primary px-md py-sm rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            Open Email Client
          </button>
        </div>
      </form>
    </Modal>
  );
}
