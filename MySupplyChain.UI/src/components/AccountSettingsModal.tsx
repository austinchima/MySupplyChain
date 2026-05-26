import Modal from "./Modal";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({
  open,
  onClose,
}: AccountSettingsModalProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteData = () => {
    // In a real app, call API to delete user data
    alert("In a production environment, this would wipe all your data from our servers.");
    localStorage.removeItem("supplychain_jwt");
    window.location.reload();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Account Settings">
        <div className="space-y-lg">
          {/* Profile Section */}
          <div className="flex items-center gap-md p-md bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xl font-bold">
              AC
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Austin Chima</h3>
              <p className="text-sm text-on-surface-variant">austinchima515@gmail.com</p>
              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                Administrator
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-sm">
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider pl-1">
              General Preferences
            </h4>
            <div className="bg-surface-container-highest/30 rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/20">
              <div className="flex items-center justify-between p-4 hover:bg-surface-container-highest/50 transition-colors cursor-pointer rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">notifications_active</span>
                  <div className="text-sm font-semibold text-on-surface">Email Notifications</div>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative shadow-inner">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-surface-container-highest/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">dark_mode</span>
                  <div className="text-sm font-semibold text-on-surface">Dark Mode</div>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative shadow-inner">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Security / Danger Zone */}
          <div className="space-y-sm">
            <h4 className="text-xs font-bold text-error uppercase tracking-wider pl-1">
              Danger Zone
            </h4>
            <div className="bg-error-container/5 rounded-2xl border border-error/20 p-md flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Delete Account & Data</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Permanently remove all your supply chain records.</p>
              </div>
              <button 
                onClick={() => setDeleteOpen(true)}
                className="bg-error/10 hover:bg-error text-error hover:text-on-error px-md py-sm rounded-lg text-xs font-bold transition-all border border-error/20 cursor-pointer"
              >
                Delete All Data
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end pt-md border-t border-outline-variant/30">
            <button
              onClick={onClose}
              className="px-md py-sm rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
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
        title="Wipe All Data?"
        message="This action is irreversible. All your products, sales history, and orders will be permanently deleted from the enterprise cloud."
        confirmText="Yes, Delete Everything"
        requireWord="DELETE"
        isDanger={true}
      />
    </>
  );
}
