import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { usePayment } from "../../context/payments/usePayment";

interface BorrowerBalanceOverviewProps {
  borrower: {
    borrower_id: number;
    first_name: string;
    last_name: string;
    token_enabled?: boolean;
    public_token?: string;
    _pending?: boolean;
    _queuedItemId?: string;
  };
  totalBalance: number;
  isOnline: boolean;
  onOpenPaymentModal: () => void;
  onOpenReminderModal: () => void;
  onPaymentSuccess: (amount: number, newBalance: number) => void;
  onSuccessMessage: (title: string, message: string) => void;
}

export default function BorrowerBalanceOverview({
  borrower,
  totalBalance,
  isOnline,
  onOpenPaymentModal,
  onOpenReminderModal,
  onPaymentSuccess,
  onSuccessMessage,
}: BorrowerBalanceOverviewProps) {
  const { t } = useTranslation();
  const { updatePublicLoanAccess } = useBorrower();
  const { createPayment } = usePayment();

  const [quickPayLoading, setQuickPayLoading] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const isPublicEnabled = borrower.token_enabled;
  const publicToken = borrower.public_token;
  const publicStatusLink = publicToken
    ? `${window.location.origin}/status/${publicToken}`
    : "";

  const handleQuickPay = (amount: number) => {
    const borrowerName = `${borrower.first_name} ${borrower.last_name}`;
    const newBalance = totalBalance - amount;

    setConfirmModal({
      isOpen: true,
      title: t("details.confirm_payment"),
      message: t("details.quick_pay_message", {
        amount: amount.toLocaleString(),
        name: borrowerName,
        currentBalance: totalBalance.toLocaleString(),
        newBalance: Math.max(0, newBalance).toLocaleString(),
      }),
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setQuickPayLoading(amount);

        const isPending = borrower._pending || Number(borrower.borrower_id) > 2147483647;
        const payOptions = isPending && borrower._queuedItemId
          ? { dependsOn: borrower._queuedItemId, dependencyField: "borrower_id" }
          : {};

        const res = await createPayment(
          {
            borrower_id: Number(borrower.borrower_id),
            amount,
            payment_type: "CASH",
            note: "",
          },
          payOptions
        );

        if (res?.ok) {
          onPaymentSuccess(amount, newBalance);
        }

        setQuickPayLoading(null);
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Total Balance Card */}
      <div className="rounded-[2rem] bg-slate-900 text-white p-6 sm:p-7 shadow-md border border-slate-800 flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {t("details.total_balance")}
          </span>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            ₱{totalBalance.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                totalBalance > 0 ? "bg-rose-400" : "bg-emerald-400"
              }`}
            />
            <span>
              {totalBalance > 0 ? "Active balance outstanding" : "Account fully paid"}
            </span>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-xs ${
              totalBalance <= 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
            }`}
          >
            {totalBalance <= 0 ? "Paid" : "With Balance"}
          </span>
        </div>
      </div>

      {/* Quick Payment Buttons */}
      {totalBalance > 0 && (
        <div className="rounded-[2rem] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t("payment.title")}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Quick Settling</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[20, 50, 100, 200].map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickPay(amount)}
                disabled={quickPayLoading !== null || amount > totalBalance}
                className="rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 py-3 px-3 text-xs md:text-sm font-black transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                {quickPayLoading === amount ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                ) : (
                  `₱${amount}`
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenPaymentModal}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 py-3 px-4 text-xs font-black text-slate-700 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-2xs"
          >
            <span className="text-sm font-black text-slate-500">₱</span>
            <span>{t("details.custom_amount")}</span>
          </button>
        </div>
      )}

      {/* Public Link — hidden offline */}
      {isOnline && (
        <div className="border border-slate-200/90 rounded-[2rem] p-5 sm:p-6 bg-white shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-950 tracking-tight uppercase">
                {t("details.public_access")}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Share real-time loan status page with borrower
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-xl text-[11px] font-black ${
                isPublicEnabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isPublicEnabled ? "ON" : "OFF"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={async () => {
                await updatePublicLoanAccess(
                  borrower.borrower_id,
                  !borrower.token_enabled
                );
              }}
              className={`w-full sm:w-auto flex-1 rounded-2xl py-3 px-4 text-xs font-black text-white transition cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-2 ${
                borrower.token_enabled
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              {borrower.token_enabled
                ? t("details.disable_access")
                : t("details.enable_access")}
            </button>

            <button
              type="button"
              disabled={!publicToken || !isPublicEnabled}
              onClick={() => {
                navigator.clipboard.writeText(publicStatusLink);
                onSuccessMessage(t("details.copied"), t("details.link_copied"));
              }}
              className="w-full sm:w-auto flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 py-3 px-4 text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{t("details.copy_status_link")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Reminder Action */}
      {isOnline && (
        <button
          type="button"
          onClick={onOpenReminderModal}
          className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 px-4 text-white font-black text-xs sm:text-sm transition shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>+ {t("details.add_reminder")}</span>
        </button>
      )}

      {/* Confirmation Modal for Quick Pay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden text-center animate-modal-pop">
            <h2 className="text-base font-black text-slate-950 tracking-tight">{confirmModal.title}</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">{confirmModal.message}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.cancel")}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
