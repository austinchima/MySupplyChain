import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useCallback } from "react";
import SupportModal from "./SupportModal";
import AccountSettingsModal from "./AccountSettingsModal";
import { getUserFromToken } from "../lib/auth";

/**
 * Root layout shell. Renders the Sidebar once and provides
 * an <Outlet /> for the active route's page content.
 */
export default function Layout() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => getUserFromToken());

  const handleUserUpdate = useCallback(() => {
    setUser(getUserFromToken());
  }, []);

  // Force the current page to re-mount by navigating away and back
  const handleDataReset = useCallback(() => {
    setSettingsOpen(false);
    // Navigate to a temporary path then immediately back to trigger a full re-render
    navigate("/dashboard", { replace: true });
    setTimeout(() => navigate(location.pathname, { replace: true }), 0);
  }, [navigate, location.pathname]);

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar 
        onOpenSupport={() => setSupportOpen(true)} 
        onOpenSettings={() => setSettingsOpen(true)} 
      />
      {/* Main content pushed right of the fixed sidebar */}
      <div className="flex-1 flex flex-col md:ml-72 min-h-screen overflow-hidden">
        <Outlet context={{ 
          onOpenSupport: () => setSupportOpen(true),
          onOpenSettings: () => setSettingsOpen(true)
        }} />
      </div>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <AccountSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onDataReset={handleDataReset}
        onUserUpdate={handleUserUpdate}
        user={user}
      />
    </div>
  );
}
