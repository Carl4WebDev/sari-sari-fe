import { useState, useEffect } from "react";
import { getQueue } from "../utils/offlineQueue";
import { useTranslation } from "../i18n/useTranslation";

interface QueueItem {
  id: string;
  url: string;
  method: string;
  description: string;
  timestamp: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PendingItemsModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setItems(getQueue());
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      POST: "bg-green-100 text-green-700",
      PUT: "bg-blue-100 text-blue-700",
      PATCH: "bg-blue-100 text-blue-700",
      DELETE: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors[method] || "bg-gray-100 text-gray-700"}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {t("pending_modal.title") || "Pending Items"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              {t("pending_modal.empty") || "No pending items"}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.description || `${item.method} ${item.url}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                    {getMethodBadge(item.method)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {t("pending_modal.sync_hint") || "These will sync automatically when you're back online."}
          </p>
        </div>
      </div>
    </div>
  );
}
