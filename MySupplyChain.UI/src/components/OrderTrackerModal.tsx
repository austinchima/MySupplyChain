import Modal from "./Modal";
import StatusBadge from "./StatusBadge";

interface OrderTrackerModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  customerName: string;
  status: string;
  date: string;
}

const statusSteps = [
  { label: "Ordered", icon: "shopping_cart", status: "processing" },
  { label: "Quality Check", icon: "verified", status: "processing" },
  { label: "Shipped", icon: "local_shipping", status: "shipped" },
  { label: "In Transit", icon: "distance", status: "shipped" },
  { label: "Delivered", icon: "task_alt", status: "delivered" },
];

export default function OrderTrackerModal({
  open,
  onClose,
  orderNumber,
  customerName,
  status,
  date,
}: OrderTrackerModalProps) {
  const currentStatusLower = status.toLowerCase();
  
  // Logic to determine current step index
  let activeIndex = 0;
  if (currentStatusLower === "shipped") activeIndex = 2;
  if (currentStatusLower === "delivered") activeIndex = 4;
  if (currentStatusLower === "cancelled") activeIndex = -1;

  return (
    <Modal open={open} onClose={onClose} title={`Order Tracking: ${orderNumber}`}>
      <div className="space-y-lg">
        {/* Header Info */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">Customer</p>
            <p className="text-sm font-bold text-on-surface">{customerName}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">Order Date</p>
            <p className="text-sm font-bold text-on-surface font-mono">{date}</p>
          </div>
        </div>

        {/* Status Tracker */}
        {currentStatusLower === "cancelled" ? (
          <div className="p-lg bg-error-container/10 border border-error/20 rounded-2xl text-center space-y-md">
            <span className="material-symbols-outlined text-error text-[48px]">cancel</span>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-error tracking-tight">Order Cancelled</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This transaction was voided and all items have been returned to inventory.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pt-md pb-lg px-4">
            {/* Timeline Line */}
            <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-outline-variant/30 hidden md:block" />
            
            <div className="space-y-8 relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= activeIndex;
                const isCurrent = index === activeIndex;

                return (
                  <div key={step.label} className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-500 ${
                      isCompleted 
                        ? "bg-primary border-primary text-on-primary shadow-lg shadow-primary/20" 
                        : "bg-surface-container border-outline-variant text-outline"
                    }`}>
                      <span className={`material-symbols-outlined text-[22px] ${isCurrent ? 'animate-pulse' : ''}`}>
                        {step.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className={`text-sm font-bold transition-colors duration-500 ${
                          isCompleted ? "text-on-surface" : "text-outline"
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && <StatusBadge variant={step.status as any} />}
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                        {isCompleted 
                          ? `Processed on ${date}` 
                          : "Estimated delivery within 3-5 business days."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-md border-t border-outline-variant/30">
          <button
            onClick={onClose}
            className="px-lg py-sm bg-surface-container-high rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
