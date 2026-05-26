interface StatusBadgeProps {
  variant: "healthy" | "low-stock" | "out-of-stock" | "processing" | "shipped" | "delivered";
  label?: string;
}

const variantStyles: Record<StatusBadgeProps["variant"], { bg: string; text: string; icon?: string }> = {
  healthy: {
    bg: "bg-secondary-container text-on-secondary-container border border-[#00a572]/20",
    text: "Healthy",
  },
  "low-stock": {
    bg: "bg-error text-on-error shadow-sm",
    text: "Low Stock",
    icon: "warning",
  },
  "out-of-stock": {
    bg: "bg-error text-on-error shadow-sm",
    text: "Out of Stock",
    icon: "error",
  },
  processing: {
    bg: "bg-surface-variant text-on-surface border border-outline-variant/50",
    text: "Processing",
  },
  shipped: {
    bg: "bg-secondary-container/20 text-secondary border border-secondary/20",
    text: "Shipped",
  },
  delivered: {
    bg: "bg-secondary-container/20 text-secondary border border-secondary/20",
    text: "Delivered",
  },
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  const style = variantStyles[variant];
  const displayLabel = label ?? style.text;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${style.bg}`}
    >
      {style.icon ? (
        <span className="material-symbols-outlined text-[14px]">
          {style.icon}
        </span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {displayLabel}
    </span>
  );
}
