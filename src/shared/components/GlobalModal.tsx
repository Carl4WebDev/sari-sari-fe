import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  confirmText?: string;
  onClose: () => void;
}

export default function GlobalModal({
  isOpen,
  title = "Notification",
  message,
  type = "info",
  confirmText = "OK",
  onClose,
}: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colorStyles = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-blue-600",
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full max-w-sm
          rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden
          transition-all duration-300
          ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        <div className={`h-1.5 w-full ${colorStyles[type]}`} />

        <div className="p-6 text-center space-y-4">
          <h2 className="text-lg font-black text-slate-950 tracking-tight">
            {title}
          </h2>

          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}