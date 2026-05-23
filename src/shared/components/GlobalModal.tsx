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
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-orange-500",
    info: "bg-[#1E3A8A]",
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed left-1/2 top-1/2 w-[90%] max-w-md
          -translate-x-1/2 -translate-y-1/2
          rounded-2xl bg-white shadow-2xl
          transition-all duration-300
          ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        <div
          className={`h-2 w-full rounded-t-2xl ${colorStyles[type]}`}
        />

        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {message}
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}