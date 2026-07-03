import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useBorrower } from "../../feature/context/borrowers/useBorrower";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface Props {
  onQuickLoan: () => void;
  onQuickPayment: () => void;
  isAnyModalOpen: boolean;
}

export default function QuickActionFab({
  onQuickLoan,
  onQuickPayment,
  isAnyModalOpen,
}: Props) {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const { borrowers } = useBorrower();
  const [expanded, setExpanded] = useState(false);

  if (isAnyModalOpen) return null;

  if (!isOnline && borrowers.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6 flex flex-col items-end gap-3">
      {expanded && (
        <>
          <button
            onClick={() => {
              setExpanded(false);
              onQuickPayment();
            }}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
          >
            <span>₱</span>
            <span className="hidden sm:inline">{t("fab.quick_payment")}</span>
          </button>
          <button
            onClick={() => {
              setExpanded(false);
              onQuickLoan();
            }}
            className="flex items-center gap-2 rounded-full bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-700"
          >
            <span>+</span>
            <span className="hidden sm:inline">{t("fab.quick_loan")}</span>
          </button>
        </>
      )}

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A8A] text-2xl text-white shadow-xl transition-transform hover:bg-[#1E3A8A]/90 ${
          expanded ? "rotate-45" : ""
        }`}
      >
        +
      </button>
    </div>
  );
}
