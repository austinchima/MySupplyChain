import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import SupportModal from "./SupportModal";
import AccountSettingsModal from "./AccountSettingsModal";

/**
 * Root layout shell. Renders the Sidebar once and provides
 * an <Outlet /> for the active route's page content.
 */
export default function Layout() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <AccountSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
