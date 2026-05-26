import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

/**
 * Root layout shell. Renders the Sidebar once and provides
 * an <Outlet /> for the active route's page content.
 * Each page is responsible for rendering its own Topbar
 * with page-specific title/search configuration.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      {/* Main content pushed right of the fixed sidebar */}
      <div className="flex-1 flex flex-col md:ml-72 min-h-screen overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
