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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <p className="text-4xl">📡</p>
          <h2 className="mt-3 text-lg font-bold text-gray-900">
            {t("offline_reminder.title") || "You're Offline"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("offline_reminder.message") ||
              "You can still view your data and add loans or payments. Changes will sync automatically when you're back online."}
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium">
            {t("offline_reminder.tip") ||
              "Go online to sync your data and access all features."}
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              setIsOpen(false);
              setDismissed(true);
            }}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700"
          >
            {t("offline_reminder.got_it") || "Got it"}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setDismissed(true);
            }}
            className="flex-1 rounded-xl bg-[#1E3A8A] py-2.5 text-sm font-medium text-white"
          >
            {t("offline_reminder.understood") || "Understood"}
          </button>
        </div>
      </div>
    </div>
  );
}
