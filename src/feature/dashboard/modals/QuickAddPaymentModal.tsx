import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { usePayment } from "../../context/payments/usePayment";
import GlobalModal from "../../../shared/components/GlobalModal";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  mode?: "navigate" | "direct";
  onPaymentCreated?: () => Promise<void> | void;
}

export default function QuickAddPaymentModal({
  isOpen,
  isClose,
  mode = "navigate",
  onPaymentCreated,
}: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { borrowers, fetchBorrowers } = useBorrower();
  const { createPayment, error: paymentError, clearError: clearPaymentError } = usePayment();

  const [search, setSearch] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    if (!isOpen) return;
    fetchBorrowers();
    clearPaymentError();
    setSelectedBorrower(null);
    setAmount("");
    setPaymentMethod("CASH");
    setNote("");
    setSearch("");
  }, [isOpen]);

  if (!isOpen) return null;

  const borrowersWithUtang = borrowers.filter(
    (b: any) => Number(b.total_loan || b.balance) > 0
  );

  const filtered = borrowersWithUtang.filter((b: any) =>
    `${b.first_name} ${b.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleBorrowerClick = (b: any) => {
    if (mode === "navigate") {
      navigate(`/borrowers/${b.borrower_id}`, {
        state: { openPayment: true },
      });
      isClose();
    } else {
      setSelectedBorrower(b);
    }
  };

  const handleDirectSubmit = async () => {
    if (!selectedBorrower || !amount || Number(amount) <= 0) return;

    setSubmitting(true);

    const payload = {
      borrower_id: selectedBorrower.borrower_id,
      amount: Number(amount),
      payment_type: paymentMethod,
      note: note.trim() || undefined,
    };

    const res = await createPayment(payload);

    if (!res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: res?.message || "Failed to create payment",
        type: "error",
      });
      setSubmitting(false);
      return;
    }

    setSelectedBorrower(null);
    setAmount("");
    setPaymentMethod("CASH");
    setNote("");
    setSearch("");
    setSubmitting(false);

    onPaymentCreated?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                {mode === "direct" ? t("payment.quick_title") : "Quick Add Payment"}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === "direct" && selectedBorrower ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-3xl bg-blue-50/80 border border-blue-200/80 px-4 py-3">
                <div>
                  <span className="text-xs font-black text-slate-950 block">
                    {selectedBorrower.first_name} {selectedBorrower.last_name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                    Bal: ₱{Number(selectedBorrower.total_loan || selectedBorrower.balance || 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBorrower(null)}
                  className="rounded-xl px-2.5 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  {t("loan.change")}
                </button>
              </div>

              {/* Quick Amount Presets */}
              <div className="flex gap-2">
                {[20, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className={`flex-1 rounded-2xl py-2.5 text-xs font-black transition cursor-pointer ${
                      amount === String(preset)
                        ? "bg-slate-950 text-white shadow-md"
                        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    ₱{preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="1"
                placeholder={t("payment.amount_placeholder")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
              />

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
              >
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
              </select>

              <input
                type="text"
                placeholder={t("payment.note_placeholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white outline-none transition"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedBorrower(null)}
                  className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
                >
                  {t("loan.cancel")}
                </button>
                <button
                  onClick={handleDirectSubmit}
                  disabled={submitting || !amount || Number(amount) <= 0}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "..." : t("payment.confirm")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                placeholder={t("payment.select_borrower") + "..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
              />

              <div className="max-h-60 overflow-y-auto space-y-2 pt-1">
                {filtered.map((b: any) => (
                  <div
                    key={b.borrower_id}
                    onClick={() => handleBorrowerClick(b)}
                    className="p-4 border border-slate-200/90 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 flex justify-between items-center transition"
                  >
                    <span className="text-xs font-black text-slate-900">
                      {b.first_name} {b.last_name}
                    </span>
                    <span className="text-xs font-black text-blue-900">
                      ₱{Number(b.total_loan || b.balance || 0).toLocaleString()}
                    </span>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8 font-semibold">
                    No borrower found with balance.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => {
          setGlobalModal({ ...globalModal, isOpen: false });
          clearPaymentError();
        }}
      />
    </div>
  );
}
