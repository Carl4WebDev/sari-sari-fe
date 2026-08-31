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
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                Add Payment
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Record a borrower payment</p>
            </div>
          </div>

          <button
            onClick={isClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Borrower Info */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  borrower?.profileImageUrl ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(
                      `${borrower?.fName} ${borrower?.lName}`
                    )
                }
                alt={`${borrower?.fName} ${borrower?.lName}`}
                className="h-14 w-14 rounded-2xl border-2 border-white shadow-xs object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">
                  {borrower?.fName} {borrower?.lName}
                </p>

                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Current Total Balance
                </p>

                <p className="mt-1 text-lg font-black text-blue-900">
                  ₱{borrower?.totalLoan?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>

            {/* Previous Payment Notes */}
            {borrower?.pastPaymentNotes &&
              borrower.pastPaymentNotes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <p className="text-[11px] font-extrabold text-slate-500">
                    Previous Notes
                  </p>

                  <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                    {borrower.pastPaymentNotes.map((entry, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200/80 bg-white p-3 space-y-1"
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

          {/* Payment Amount */}
          <input
            name="amount"
            type="number"
            placeholder="Payment Amount (₱)"
            value={form.amount}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
          />

          {/* Payment Type */}
          <select
            name="paymentType"
            value={form.paymentType}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          >
            <option value="">Select Payment Type</option>
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
          </select>

          {/* Note */}
          <textarea
            name="note"
            placeholder="Optional note..."
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={isClose}
            className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save Payment"}
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
