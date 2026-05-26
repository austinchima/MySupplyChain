import { useState } from "react";

interface TopbarProps {
  /** Optional page title shown in the topbar */
  title?: string;
  /** Optional subtitle shown after the title */
  subtitle?: string;
  /** If true, shows a search bar instead of a title */
  showSearch?: boolean;
  /** Placeholder text for the search bar */
  searchPlaceholder?: string;
  onOpenSupport?: () => void;
  onOpenSettings?: () => void;
}

const mockNotifications = [
  { id: 1, title: "Low Stock Alert", body: "SKU-001 (Microchip) is below reorder point.", time: "2 mins ago", type: "warning" },
  { id: 2, title: "Order Shipped", body: "Order #SC-5821 has been dispatched.", time: "1 hour ago", type: "info" },
  { id: 3, title: "System Update", body: "New AI forecasting model is now live.", time: "4 hours ago", type: "success" },
];

export default function Topbar({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = "Search inventory, SKUs, or orders...",
  onOpenSupport,
  onOpenSettings,
}: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-40 flex justify-between items-center h-16 px-md w-full">
      <div className="flex items-center gap-lg">
        {/* Mobile menu button */}
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors md:hidden">
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Title or Search */}
        {title && (
          <h2 className="text-lg font-semibold text-on-surface">
            {title}
            {subtitle && (
              <span className="text-outline ml-2 font-normal">{subtitle}</span>
            )}
          </h2>
        )}

        {showSearch && (
          <div className="relative hidden lg:block w-96">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
        )}
      </div>

      {/* ── Trailing Actions ── */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative cursor-pointer ${
              notificationsOpen ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-highest border border-outline-variant rounded-2xl shadow-2xl z-50 overflow-hidden border-white/5">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                <h3 className="text-sm font-bold text-on-surface">Notifications</h3>
                <span className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/20">
                {mockNotifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'warning' ? 'bg-error' : n.type === 'success' ? 'bg-primary' : 'bg-secondary'
                      }`} />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{n.title}</p>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-outline font-medium pt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center bg-surface-container-low border-t border-outline-variant/30">
                <button className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                  View all activity history
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={onOpenSupport}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors hidden sm:flex cursor-pointer"
          title="Support"
        >
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <button 
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors hidden sm:flex cursor-pointer"
          title="Account Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="ml-2 pl-2 border-l border-outline-variant">
          <div 
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
          >
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
