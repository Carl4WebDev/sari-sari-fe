import { useEffect, useState } from "react";
import { usePayment } from "../../context/payments/usePayment";
import { useBorrower } from "../../context/borrowers/useBorrower";
import GlobalModal from "../../../shared/components/GlobalModal";

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
}

export default function AddPaymentModal({
  isOpen,
  isClose,
  borrower,
}: Props) {
  const { createPayment, error: paymentError, clearError: clearPaymentError } = usePayment();
const {
  fetchBorrowerTransactions,
  createBorrowerNote,
  fetchBorrowerNotes,
} = useBorrower();

  const [animate, setAnimate] = useState(false);

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

    const res = await createPayment(payload);

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

  await fetchBorrowerTransactions(borrower.id);

  if (form.note.trim()) {
    await createBorrowerNote(
      borrower.id,
      form.note
    );

    await fetchBorrowerNotes(borrower.id);
  }

  setForm({
    amount: "",
    note: "",
    paymentType: "",
  });

  setLoading(false);
  isClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
      <div
        className={`fixed top-0 left-0 w-full bg-white rounded-b-2xl shadow-xl transform transition-transform duration-300 ease-out ${
          animate ? "translate-y-0" : "-translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">

          {/* Title */}
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Add Payment
          </h2>

{/* Borrower Info */}
<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
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
      className="h-16 w-16 rounded-full border border-gray-200 object-cover"
    />

    <div className="min-w-0 flex-1">
      <p className="truncate text-lg font-bold text-gray-800">
        {borrower?.fName} {borrower?.lName}
      </p>

      <p className="text-xs text-gray-500">
        Current Total Balance
      </p>

      <p className="mt-1 text-xl font-extrabold text-[#1E3A8A]">
        ₱{borrower?.totalLoan?.toLocaleString() ?? 0}
      </p>
    </div>
  </div>

  {/* Previous Payment Notes */}
  {borrower?.pastPaymentNotes &&
    borrower.pastPaymentNotes.length > 0 && (
      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-gray-500">
          Previous Notes
        </p>

        <div className="max-h-40 space-y-2 overflow-y-auto">
          {borrower.pastPaymentNotes.map((entry, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex justify-between text-xs text-gray-400">
                <span>{entry.date}</span>

                <span className="font-medium text-[#16A34A]">
                  ₱{entry.amount.toLocaleString()}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-700">
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
            placeholder="Payment Amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
          />

          {/* Payment Type */}
          <select
            name="paymentType"
            value={form.paymentType}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
          >
            <option value="">Select Payment Type</option>
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="CREDIT CARD">Credit Card</option>
            <option value="DEBIT CARD">Debit Card</option>
          </select>

          {/* Note */}
          <textarea
            name="note"
            placeholder="Optional note..."
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none resize-none"
          />

          {/* Buttons */}
          <div className="flex gap-3">

            <button
              onClick={isClose}
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="w-1/2 rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white"
            >
              Save Payment
            </button>

          </div>

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
