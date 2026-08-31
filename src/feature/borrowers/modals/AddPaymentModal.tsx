import { useEffect, useState } from "react";
import { usePayment } from "../../context/payments/usePayment";
import { useBorrower } from "../../context/borrowers/useBorrower";
import GlobalModal from "../../../shared/components/GlobalModal";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Borrower {
  id: number;
  fName: string;
  lName: string;
  totalLoan?: number;
  profileImageUrl: string;
  pastPaymentNotes?: {
    date: string;
    amount: number;
    note: string;
  }[];
}

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrower: Borrower | null;
  onPaymentCreated?: (amount: number) => void;
}

export default function AddPaymentModal({
  isOpen,
  isClose,
  borrower,
  onPaymentCreated,
}: Props) {
  const { t } = useTranslation();
  const { createPayment, error: paymentError, clearError: clearPaymentError } = usePayment();
const {
  fetchBorrowerTransactions,
  createBorrowerNote,
  fetchBorrowerNotes,
} = useBorrower();

  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (paymentError) {
      setGlobalModal({ isOpen: true, title: "Error", message: paymentError, type: "error" });
    }
  }, [paymentError]);

  const [form, setForm] = useState({
    amount: "",
    note: "",
    paymentType: "",
  });

  useEffect(() => {
    if (isOpen) {
      clearPaymentError();
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!borrower) return;
    if (!form.amount || !form.paymentType) {
      setGlobalModal({
        isOpen: true,
        title: "Required Fields",
        message: "Amount and Payment Type are required.",
        type: "warning",
      });
      return;
    }

    const payload = {
      borrower_id: borrower.id,
      amount: Number(form.amount),
      payment_type: form.paymentType,
      note: form.note,
    };

    // Pass dependency info for offline borrowers so queue resolves real ID after sync
    const isPending = (borrower as any)._pending;
    const queuedItemId = (borrower as any)._queuedItemId;
    const payOptions = isPending && queuedItemId
      ? { dependsOn: queuedItemId, dependencyField: "borrower_id" }
      : {};

    const res = await createPayment(payload, payOptions);

if (!res?.ok) {
  setGlobalModal({
    isOpen: true,
    title: "Error",
    message: res?.message || "Failed to create payment",
    type: "error",
  });
  setLoading(false);
  return;
}

  // Queued for offline sync — show toast and close
  if (res.queued) {
    setGlobalModal({
      isOpen: true,
      title: t("connection.queued_success"),
      message: "",
      type: "success",
    });
    setForm({ amount: "", note: "", paymentType: "" });
    setLoading(false);
    onPaymentCreated?.(Number(form.amount));
    isClose();
    return;
  }

  // Refresh data — wrapped in try-catch so offline failures don't crash the page
  try {
    await fetchBorrowerTransactions(borrower.id);

    if (form.note.trim()) {
      await createBorrowerNote(borrower.id, form.note);
      await fetchBorrowerNotes(borrower.id);
    }
  } catch (e) {
    console.warn("[AddPayment] Failed to refresh after payment:", e);
  }

  const paidAmount = Number(form.amount);

  setForm({
    amount: "",
    note: "",
    paymentType: "",
  });

  setLoading(false);
  onPaymentCreated?.(paidAmount);
  isClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                Add Payment
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Record a borrower payment</p>
            </div>
          </div>

          <button
            onClick={isClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer active:scale-95"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Borrower Info Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-3.5">
              {borrower?.profileImageUrl ? (
                <img
                  src={borrower.profileImageUrl}
                  alt={`${borrower.fName} ${borrower.lName}`}
                  className="h-13 w-13 rounded-2xl border-2 border-white shadow-2xs object-cover shrink-0"
                />
              ) : (
                <div className="h-13 w-13 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-sm font-black shadow-xs shrink-0">
                  {borrower?.fName?.[0]}
                  {borrower?.lName?.[0]}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">
                  {borrower?.fName} {borrower?.lName}
                </p>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Current Total Balance
                </p>

                <p className="text-xl font-black text-blue-950 mt-0.5">
                  ₱{borrower?.totalLoan?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>

            {/* Previous Payment Notes */}
            {borrower?.pastPaymentNotes &&
              borrower.pastPaymentNotes.length > 0 && (
                <div className="space-y-2 pt-2.5 border-t border-slate-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Previous Notes
                  </p>

                  <div className="max-h-28 space-y-1.5 overflow-y-auto pr-1">
                    {borrower.pastPaymentNotes.map((entry, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-100 bg-white p-2.5 space-y-0.5"
                      >
                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                          <span>{entry.date}</span>
                          <span className="font-black text-emerald-600">
                            ₱{entry.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          {entry.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Quick Amount Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Payment Amount
              </label>
              {borrower?.totalLoan && Number(borrower.totalLoan) > 0 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, amount: String(borrower.totalLoan) })}
                  className="text-[11px] font-black text-blue-600 hover:underline cursor-pointer"
                >
                  Pay Full (₱{Number(borrower.totalLoan).toLocaleString()})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm pointer-events-none">
                ₱
              </span>
              <input
                name="amount"
                type="number"
                min="1"
                placeholder="0"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3.5 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Payment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="relative">
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className="w-full appearance-none rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3.5 pl-4 pr-10 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition shadow-2xs cursor-pointer"
              >
                <option value="">Select Payment Type</option>
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Note (Optional)
            </label>
            <textarea
              name="note"
              placeholder="e.g. Paid in cash at store, partial payment..."
              value={form.note}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={isClose}
            className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 py-3.5 text-xs sm:text-sm font-black text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl bg-emerald-700 hover:bg-emerald-800 py-3.5 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Payment</span>
              </>
            )}
          </button>
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => {
          setGlobalModal({
            ...globalModal,
            isOpen: false,
          });
          clearPaymentError();
        }}
      />
    </div>
  );
}
