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
    <div className="fixed top-4 left-1/2 z-[200] -translate-x-1/2 animate-slide-down">
      <div className="flex items-center gap-4 rounded-2xl bg-[#16A34A] px-5 py-4 text-white shadow-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
          ✓
        </div>
        <div>
          <p className="text-sm font-semibold">
            ₱{amount.toLocaleString()} payment recorded
          </p>
          <p className="text-xs text-green-100">
            {borrowerName} — Balance: ₱{Math.max(0, newBalance).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded-lg p-2 text-green-100 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
