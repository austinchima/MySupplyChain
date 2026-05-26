interface TopbarProps {
  /** Optional page title shown in the topbar */
  title?: string;
  /** Optional subtitle shown after the title */
  subtitle?: string;
  /** If true, shows a search bar instead of a title */
  showSearch?: boolean;
  /** Placeholder text for the search bar */
  searchPlaceholder?: string;
}

export default function Topbar({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = "Search inventory, orders, or alerts...",
}: TopbarProps) {
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
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <button className="w-10 h-10 rounded-full items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors hidden sm:flex">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <button className="w-10 h-10 rounded-full items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors hidden sm:flex">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="ml-2 pl-2 border-l border-outline-variant">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity">
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
