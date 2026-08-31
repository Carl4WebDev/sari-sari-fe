import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useBorrower } from "../../feature/context/borrowers/useBorrower";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface Props {
  onQuickLoan: () => void;
  onQuickPayment: () => void;
  isAnyModalOpen?: boolean;
  hidden?: boolean;
}

export default function QuickActionFab({
  onQuickLoan,
  onQuickPayment,
  isAnyModalOpen,
  hidden,
}: Props) {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const { borrowers } = useBorrower();
  const [expanded, setExpanded] = useState(false);

  if (isAnyModalOpen || hidden) return null;

  if (!isOnline && borrowers.length === 0) return null;

  return (
    <>
      {/* Background Dim Overlay when FAB is open to prevent awkward overlap */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity animate-backdrop-fade cursor-pointer"
        />
      )}

      <div className="fixed bottom-6 sm:bottom-8 right-4 sm:right-8 z-50 pointer-events-none">
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {expanded && (
            <div className="flex flex-col items-end gap-2.5 mb-1 animate-modal-pop">
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  onQuickPayment();
                }}
                className="group flex items-center gap-3 rounded-2xl sm:rounded-3xl bg-emerald-700 hover:bg-emerald-800 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-slate-950/20 border border-emerald-600 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-xl bg-emerald-600/60 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <span className="text-xs sm:text-sm font-black">₱</span>
                </div>
                <span className="tracking-tight">{t("fab.quick_payment")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  onQuickLoan();
                }}
                className="group flex items-center gap-3 rounded-2xl sm:rounded-3xl bg-slate-900 hover:bg-slate-800 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-slate-950/20 border border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="tracking-tight">{t("fab.quick_loan")}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl sm:rounded-3xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-950/50 border border-slate-700/80 transition-all duration-300 active:scale-95 cursor-pointer ${
              expanded ? "rotate-45 bg-slate-800 ring-4 ring-blue-500/20" : "hover:scale-105"
            }`}
            aria-label="Quick Actions"
            title={expanded ? "Close Quick Menu" : "Open Quick Actions"}
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12m6-6H6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
