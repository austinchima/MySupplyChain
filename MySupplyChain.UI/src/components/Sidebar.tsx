import { NavLink } from "react-router-dom";
import { useState } from "react";
import CreateOrderModal from "./CreateOrderModal";

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const mainNavItems: NavItem[] = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/inventory", icon: "inventory_2", label: "Inventory" },
  { to: "/forecasting", icon: "monitoring", label: "Forecasting" },
  { to: "/orders", icon: "receipt_long", label: "Orders" },
];

const footerNavItems: NavItem[] = [
  { to: "#", icon: "contact_support", label: "Support" },
  { to: "#", icon: "manage_accounts", label: "Account Settings" },
];

function SidebarLink({ to, icon, label }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) =>
        `flex items-center gap-4 mx-md px-md py-sm rounded-full transition-all duration-200 text-sm font-semibold tracking-wide ${
          isActive
            ? "bg-secondary-container text-on-secondary-container shadow-sm scale-[0.98]"
            : "text-on-surface-variant hover:bg-surface-container-highest"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
          >
            {icon}
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  onOpenSupport: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ onOpenSupport, onOpenSettings }: SidebarProps) {
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  return (
    <>
      <aside className="h-screen w-72 flex-col fixed left-0 top-0 z-50 bg-surface-container border-r border-outline-variant shadow-sm hidden md:flex">
        <div className="flex flex-col h-full py-lg space-y-xs">
          {/* ── Brand Header ── */}
          <div className="px-md pb-md mb-md border-b border-outline-variant/30 flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary-container filled">
                widgets
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight leading-none">
                SupplyChain
              </h1>
              <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">
                Global Inventory Control
              </p>
            </div>
          </div>

          {/* ── CTA Button → Opens CreateOrderModal ── */}
          <div className="px-md mb-md">
            <button
              onClick={() => setOrderModalOpen(true)}
              className="w-full bg-primary text-on-primary py-2.5 px-md rounded-full font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-sm shadow-[0_2px_12px_rgba(175,198,255,0.15)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create New Order
            </button>
          </div>

          {/* ── Main Navigation ── */}
          <nav className="flex-1 overflow-y-auto space-y-1">
            {mainNavItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </nav>

          {/* ── Footer Navigation ── */}
          <div className="mt-auto pt-md border-t border-outline-variant/30 space-y-1">
            <button
              onClick={onOpenSupport}
              className="w-[calc(100%-32px)] flex items-center gap-4 text-on-surface-variant mx-md px-md py-sm rounded-full hover:bg-surface-container-highest transition-colors duration-200 text-sm font-semibold tracking-wide cursor-pointer text-left"
            >
              <span className="material-symbols-outlined">contact_support</span>
              Support
            </button>
            <button
              onClick={onOpenSettings}
              className="w-[calc(100%-32px)] flex items-center gap-4 text-on-surface-variant mx-md px-md py-sm rounded-full hover:bg-surface-container-highest transition-colors duration-200 text-sm font-semibold tracking-wide cursor-pointer text-left"
            >
              <span className="material-symbols-outlined">manage_accounts</span>
              Account Settings
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("supplychain_jwt");
                window.location.reload();
              }}
              className="w-[calc(100%-32px)] flex items-center gap-4 text-error mx-md px-md py-sm rounded-full hover:bg-error/10 hover:text-error transition-colors duration-200 text-sm font-semibold tracking-wide cursor-pointer text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Create Order Modal rendered here so it's always available */}
      <CreateOrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onCreated={() => {
          // Could trigger a global refresh here
        }}
      />
    </>
  );
}
