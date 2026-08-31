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
    <div className="fixed bottom-8 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col items-end gap-3 pointer-events-auto">
        {expanded && (
          <>
            <button
              onClick={() => {
                setExpanded(false);
                onQuickPayment();
              }}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-xl transition-all hover:bg-emerald-700 cursor-pointer"
            >
              <span className="text-base">₱</span>
              <span>{t("fab.quick_payment")}</span>
            </button>
            <button
              onClick={() => {
                setExpanded(false);
                onQuickLoan();
              }}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-xl transition-all hover:bg-indigo-700 cursor-pointer"
            >
              <span className="text-base">+</span>
              <span>{t("fab.quick_loan")}</span>
            </button>
          </>
        )}

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-blue-900 text-white shadow-2xl transition-transform duration-300 hover:bg-blue-950 active:scale-95 cursor-pointer ${
            expanded ? "rotate-45" : ""
          }`}
          aria-label="Quick Actions"
        >
          <svg className="w-7 h-7 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12m6-6H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
