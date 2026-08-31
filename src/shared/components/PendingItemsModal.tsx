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
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-backdrop-fade">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                {t("pending_modal.title") || "Pending Items"}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Queued offline changes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-400">
              {t("pending_modal.empty") || "No pending items"}
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-950 truncate">
                      {item.description || `${item.method} ${item.url}`}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {formatTime(item.timestamp)}
                    </p>
                  </div>
                  {getMethodBadge(item.method)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] font-semibold text-slate-500 text-center leading-relaxed">
            {t("pending_modal.sync_hint") || "These will sync automatically when you're back online."}
          </p>
        </div>
      </div>
    </div>
  );
}
