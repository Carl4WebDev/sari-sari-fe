import { useState, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";

export default function OfflineReminderModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      if (!dismissed) {
        setIsOpen(true);
      }
    };

    const handleOnline = () => {
      setIsOpen(false);
      setDismissed(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [dismissed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade">
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden text-center animate-modal-pop">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0 shadow-2xs mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 010-12.728M5.636 5.636L3 3m2.636 2.636l2.829 2.829m-2.829-2.829A5 5 0 004.5 12c0 1.25.452 2.395 1.207 3.284" />
          </svg>
        </div>
        
        <h2 className="text-base font-black text-slate-950 tracking-tight">
          {t("offline_reminder.title") || "You're Offline"}
        </h2>
        <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">
          {t("offline_reminder.message") ||
            "You can still view your data and add loans or payments. Changes will sync automatically when you're back online."}
        </p>
        <div className="mt-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 px-3 py-2 text-[11px] font-black text-amber-700">
          {t("offline_reminder.tip") ||
            "Go online to sync your data and access all features."}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setIsOpen(false);
              setDismissed(true);
            }}
            className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
          >
            {t("offline_reminder.got_it") || "Got it"}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setDismissed(true);
            }}
            className="flex-1 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            {t("offline_reminder.understood") || "Understood"}
          </button>
        </div>
      </div>
    </div>
  );
}
