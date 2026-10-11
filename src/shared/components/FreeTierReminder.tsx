import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";

const REMINDER_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = "free_reminder_last_shown";

export default function FreeTierReminder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const shouldShow = useCallback(() => {
    const isFreeLocal = localStorage.getItem("is_free_local") === "true";
    if (!isFreeLocal) return false;

    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (!lastShown) return true;
    return Date.now() - Number(lastShown) >= REMINDER_INTERVAL_MS;
  }, []);

  useEffect(() => {
    // Check on mount
    if (shouldShow()) {
      setIsOpen(true);
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }

    const interval = setInterval(() => {
      if (shouldShow()) {
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }
    }, 60_000); // Check every minute

    return () => clearInterval(interval);
  }, [shouldShow]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const handleBackToLanding = () => {
    setIsOpen(false);
    localStorage.removeItem("user_token");
    localStorage.removeItem("is_free_local");
    localStorage.removeItem("user");
    localStorage.removeItem("demo_store_data");
    localStorage.removeItem("local_warning_dismissed");
    localStorage.removeItem(STORAGE_KEY);
    navigate("/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-backdrop-fade">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-950/30 border border-slate-200/90 overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100/90 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/30">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.54 20h17.92a1 1 0 00.86-1.28l-8.6-14.86a1 1 0 00-1.72 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base leading-tight tracking-tight">
                {t("free_reminder.title")}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {t("free_reminder.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Risks */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.54 20h17.92a1 1 0 00.86-1.28l-8.6-14.86a1 1 0 00-1.72 0z" />
              </svg>
              <span className="text-xs text-slate-700">{t("free_reminder.risk_1")}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.54 20h17.92a1 1 0 00.86-1.28l-8.6-14.86a1 1 0 00-1.72 0z" />
              </svg>
              <span className="text-xs text-slate-700">{t("free_reminder.risk_2")}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.54 20h17.92a1 1 0 00.86-1.28l-8.6-14.86a1 1 0 00-1.72 0z" />
              </svg>
              <span className="text-xs text-slate-700">{t("free_reminder.risk_3")}</span>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <div className="text-center">
              <p className="text-xs font-bold text-amber-800">{t("free_reminder.upgrade_title")}</p>
              <p className="text-2xl font-black text-amber-600">{t("free_reminder.upgrade_price")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-slate-700 font-semibold">{t("free_reminder.benefit_1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-slate-700 font-semibold">{t("free_reminder.benefit_2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-slate-700 font-semibold">{t("free_reminder.benefit_3")}</span>
              </div>
            </div>

            {/* Phone CTA */}
            <div className="text-center pt-1">
              <p className="text-xs font-bold text-slate-600 mb-1">{t("free_reminder.cta")}</p>
              <a
                href="tel:09276168478"
                className="inline-flex items-center gap-2 text-lg font-black text-blue-700 hover:text-blue-800 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t("free_reminder.phone")}
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            {t("free_reminder.export_hint")}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleBackToLanding}
              className="w-full px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition text-center"
            >
              {t("landing.back_to_home")}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full px-4 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition text-center"
            >
              {t("free_reminder.dismiss")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}