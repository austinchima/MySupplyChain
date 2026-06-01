import Modal from "./Modal";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { auth } from "../lib/api";
import { setToken, clearToken } from "../lib/auth";
import type { TokenUser } from "../lib/auth";

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onDataReset?: () => void;
  onUserUpdate?: () => void;
  user: TokenUser | null;
}

export default function AccountSettingsModal({
  open,
  onClose,
  onDataReset,
  onUserUpdate,
  user,
}: AccountSettingsModalProps) {
  const [resetLedgerOpen, setResetLedgerOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Username edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username ?? "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const initials = user
    ? user.username
        .split(/[\s._-]+/)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("") || user.email[0]?.toUpperCase() || "?"
    : "?";

  const roleBadge =
    user?.role === "Admin" ? "System Administrator" : "Team Member";

  const handleResetLedger = async () => {
    await auth.resetLedger();
    onDataReset?.();
  };

  const handleDeleteAccount = async () => {
    await auth.deleteAccount();
    clearToken();
    window.location.reload();
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }
    if (!confirmPassword) {
      setUsernameError("Please enter your current password to confirm this change.");
      return;
    }
    setIsSavingUsername(true);
    setUsernameError(null);
    try {
      const res = await auth.updateUsername(newUsername, confirmPassword);
      setToken(res.token);
      onUserUpdate?.();
      setIsEditingUsername(false);
      setConfirmPassword("");
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : "Failed to update username");
    } finally {
      setIsSavingUsername(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Account Settings">
        <div className="space-y-lg font-['Outfit']">
          {/* Profile Section */}
          <div className="flex items-center gap-md p-md bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xl font-bold border border-primary/20 shadow-sm">
              {initials}
            </div>
            
            {isEditingUsername ? (
              <div className="flex-1 space-y-sm">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={isSavingUsername}
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-bold text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                    autoFocus
                    placeholder="New username"
                  />
                  <button
                    onClick={handleSaveUsername}
                    disabled={isSavingUsername}
                    className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isSavingUsername ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    ) : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(user?.username ?? "");
                      setConfirmPassword("");
                      setUsernameError(null);
                    }}
                    disabled={isSavingUsername}
                    className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-highest cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSavingUsername}
                  placeholder="Enter current password to confirm"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                />
                {usernameError && (
                  <p className="text-xs text-error font-medium">{usernameError}</p>
                )}
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-on-surface">
                    {user?.username ?? "Unknown User"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditingUsername(true);
                      setNewUsername(user?.username ?? "");
                    }}
                    className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant cursor-pointer transition-colors"
                    title="Edit Username"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">
                  {user?.email ?? "No email"}
                </p>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-secondary-container text-on-secondary-container border border-secondary/20 shadow-sm">
                  {roleBadge}
                </span>
              </div>
            )}
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
            <div className="space-y-sm">
              {/* Reset Ledger */}
              <div className="bg-surface-container-highest/10 rounded-2xl border border-outline-variant/20 p-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Reset Business Ledger</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">Wipe all products and orders, but keep your login credentials.</p>
                </div>
                <button 
                  onClick={() => setResetLedgerOpen(true)}
                  className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-md py-sm rounded-xl text-xs font-black transition-all border border-primary/20 cursor-pointer shadow-sm shadow-primary/10"
                >
                  Reset Data
                </button>
              </div>

              {/* Delete Account */}
              <div className="bg-error-container/5 rounded-2xl border border-error/20 p-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Delete Account Permanently</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">Destroy your entire profile, credentials, and all enterprise data.</p>
                </div>
                <button 
                  onClick={() => setDeleteAccountOpen(true)}
                  className="bg-error/10 hover:bg-error text-error hover:text-on-error px-md py-sm rounded-xl text-xs font-black transition-all border border-error/20 cursor-pointer shadow-sm shadow-error/10"
                >
                  Close Account
                </button>
              </div>
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

      {/* Reset Ledger Confirmation */}
      <ConfirmationModal
        open={resetLedgerOpen}
        onClose={() => setResetLedgerOpen(false)}
        onConfirm={handleResetLedger}
        title="Reset Business Ledger?"
        message="This will clear your product catalog, sales history, and orders. Your account profile will remain intact for a fresh start."
        confirmText="Confirm Reset"
        requireWord="RESET"
        isDanger={true}
      />

      {/* Delete Account Confirmation */}
      <ConfirmationModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Profile & Data?"
        message="This action is final. Your account credentials and all supply chain telemetry will be permanently purged from our servers."
        confirmText="Delete Account"
        requireWord="DELETE"
        isDanger={true}
      />
    </>
  );
}
