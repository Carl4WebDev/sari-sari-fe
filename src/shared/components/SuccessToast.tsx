import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  amount: number;
  borrowerName: string;
  newBalance: number;
  onClose: () => void;
}

export default function SuccessToast({
  isOpen,
  amount,
  borrowerName,
  newBalance,
  onClose,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 left-1/2 z-[200] -translate-x-1/2 w-[92%] max-w-sm animate-slide-down">
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-xl border border-emerald-500/50">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">
            ₱{amount.toLocaleString()} payment recorded
          </p>
          <p className="text-[11px] text-emerald-100 font-medium truncate">
            {borrowerName} — Bal: ₱{Math.max(0, newBalance).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
