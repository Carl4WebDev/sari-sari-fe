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

  const [animate, setAnimate] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const borrowersWithUtang = borrowers.filter(
    (b: any) => Number(b.total_loan) > 0
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
      className="fixed inset-0 z-50 bg-black/40"
      onClick={isClose}
    >
      <div
        className={`fixed top-0 left-0 w-full bg-white rounded-b-2xl shadow-xl
        transform transition-transform duration-300
        ${animate ? "translate-y-0" : "-translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            {mode === "direct" ? t("payment.quick_title") : "Quick Add Payment"}
          </h2>

          {mode === "direct" && selectedBorrower ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-sm font-medium text-[#1E3A8A]">
                  {selectedBorrower.first_name} {selectedBorrower.last_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Bal: ₱{Number(selectedBorrower.total_loan).toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedBorrower(null)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-500"
                  >
                    {t("loan.change")}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {[20, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      amount === String(preset)
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
              />

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedBorrower(null)}
                  className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm"
                >
                  {t("loan.cancel")}
                </button>
                <button
                  onClick={handleDirectSubmit}
                  disabled={submitting || !amount || Number(amount) <= 0}
                  className="w-1/2 rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "..." : t("payment.confirm")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                placeholder={t("payment.select_borrower") + "..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
              />

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filtered.map((b: any) => (
                  <div
                    key={b.borrower_id}
                    onClick={() => handleBorrowerClick(b)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between"
                  >
                    <span>
                      {b.first_name} {b.last_name}
                    </span>
                    <span className="text-[#1E3A8A] font-semibold">
                      ₱{Number(b.total_loan).toLocaleString()}
                    </span>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    No borrower found.
                  </p>
                )}
              </div>
            </>
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
