import type { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: string;
  /** Color token for the icon/trend accent. Defaults to "primary". */
  accent?: "primary" | "secondary" | "error";
  children?: ReactNode;
}

const accentColors = {
  primary: {
    iconBg: "bg-primary-container/20",
    iconText: "text-primary",
    trendText: "text-primary",
  },
  secondary: {
    iconBg: "bg-secondary-container/20",
    iconText: "text-secondary",
    trendText: "text-secondary",
  },
  error: {
    iconBg: "bg-error/20",
    iconText: "text-error",
    trendText: "text-error",
  },
};

export default function SummaryCard({
  title,
  value,
  trend,
  trendDirection = "up",
  icon,
  accent = "primary",
  children,
}: SummaryCardProps) {
  const colors = accentColors[accent];
  const trendIcon =
    trendDirection === "up"
      ? "trending_up"
      : trendDirection === "down"
        ? "trending_down"
        : "trending_flat";

  const isErrorCard = accent === "error";

  return (
    <div
      className={`rounded-xl p-md flex flex-col justify-between relative overflow-hidden group ${
        isErrorCard
          ? "bg-[#2f1115] border border-error/30 shadow-[0_4px_20px_rgba(255,180,171,0.05)]"
          : "glass-card"
      }`}
    >
      <div className="flex justify-between items-start mb-sm">
        <h3
          className={`text-base font-semibold ${
            isErrorCard ? "text-error" : "text-on-surface-variant"
          }`}
        >
          {title}
        </h3>
        <div
          className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}
        >
          <span
            className={`material-symbols-outlined ${colors.iconText} text-[20px]`}
          >
            {icon}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between z-10">
        <span
          className={`text-[32px] leading-10 font-bold tracking-tight font-mono ${
            isErrorCard ? "text-error" : "text-on-surface"
          }`}
        >
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-medium ${colors.trendText} flex items-center gap-0.5 pb-1`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {trendIcon}
            </span>
            {trend}
          </span>
        )}
        {children}
      </div>

      {/* Decorative background icon */}
      {!isErrorCard && (
        <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">
            {icon}
          </span>
        </div>
      )}
      {isErrorCard && (
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-error/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
