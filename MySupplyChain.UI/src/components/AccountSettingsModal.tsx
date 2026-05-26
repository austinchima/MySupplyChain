import Modal from "./Modal";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { auth } from "../lib/api";

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({
  open,
  onClose,
}: AccountSettingsModalProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleDeleteData = async () => {
    setIsWiping(true);
    try {
      await auth.wipeData();
      localStorage.removeItem("supplychain_jwt");
      window.location.reload();
    } catch (err) {
      alert("Failed to wipe data. System remains intact.");
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Account Settings">
        <div className="space-y-lg font-['Outfit']">
          {/* Profile Section */}
          <div className="flex items-center gap-md p-md bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xl font-bold border border-primary/20 shadow-sm">
              AC
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Austin Chima</h3>
              <p className="text-sm text-on-surface-variant font-medium">austinchima515@gmail.com</p>
              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-secondary-container text-on-secondary-container border border-secondary/20 shadow-sm">
                System Administrator
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-sm">
            <h4 className="text-[10px] font-black text-outline uppercase tracking-widest pl-1">
              General Preferences
            </h4>
            <div className="bg-surface-container-highest/30 rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/20 overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-surface-container-highest/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">notifications_active</span>
                  <div className="text-sm font-bold text-on-surface">Email Notifications</div>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative shadow-inner">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-surface-container-highest/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">dark_mode</span>
                  <div className="text-sm font-bold text-on-surface">Dark Mode Interface</div>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative shadow-inner">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Security / Danger Zone */}
          <div className="space-y-sm">
            <h4 className="text-[10px] font-black text-error uppercase tracking-widest pl-1">
              Data Security / Danger Zone
            </h4>
            <div className="bg-error-container/5 rounded-2xl border border-error/20 p-md flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Purge Account & Ledger</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">Permanently destroy all products, history, and active orders.</p>
              </div>
              <button 
                onClick={() => setDeleteOpen(true)}
                className="bg-error/10 hover:bg-error text-error hover:text-on-error px-md py-sm rounded-xl text-xs font-black transition-all border border-error/20 cursor-pointer shadow-sm shadow-error/10"
              >
                Wipe All Data
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end pt-md border-t border-outline-variant/30">
            <button
              onClick={onClose}
              className="px-lg py-sm rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteData}
        title="Wipe Enterprise Cloud?"
        message="This action is absolute and irreversible. Your entire supply chain ledger, product catalog, and predictive models will be purged from the secure cloud."
        confirmText={isWiping ? "Purging..." : "Yes, Purge Everything"}
        requireWord="PURGE"
        isDanger={true}
      />
    </>
  );
}
