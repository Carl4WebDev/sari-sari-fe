import { useEffect, useState } from "react";

import GlobalModal from "../../../shared/components/GlobalModal";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrowerId: number;
  currentBalance: number;
  contactNumber?: string | null;
  onCreateReminder: (payload: any) => Promise<any>;
}

export default function AddReminderModal({
  isOpen,
  isClose,
  borrowerId,
  currentBalance,
  contactNumber,
  onCreateReminder,
}: Props) {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendSms, setSendSms] = useState(false);


  const [globalModal, setGlobalModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
});

  const [form, setForm] = useState({
    amount_expected: "",
    due_date: "",
    note: "",
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.due_date) {
      setGlobalModal({
        isOpen: true,
        title: "Required Fields",
        message: "Due date is required.",
        type: "warning",
      });
      return;
    }

    const amount = Number(form.amount_expected || 0);

if (amount > currentBalance) {

  setGlobalModal({
  isOpen: true,
  title: "Warning",
  message: "Expected amount cannot be higher than current balance.",
  type: "warning",
});
  return;
}

    setLoading(true);

    const res = await onCreateReminder({
      borrower_id: borrowerId,
      amount_expected: amount,
      due_date: form.due_date,
      note: form.note,
      send_sms: sendSms,
    });

    if (!res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: res?.message || "Failed to create reminder",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (res?.ok) {
      setForm({
        amount_expected: "",
        due_date: "",
        note: "",
      });

      isClose();
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 left-0 w-full bg-white
          rounded-b-2xl shadow-xl
          transform transition-transform duration-300 ease-out
          ${animate ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="mx-auto max-w-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Add Collection Reminder
          </h2>

          <div className="rounded-xl bg-[#1E3A8A] p-4 text-white">
  <p className="text-sm text-blue-100">Current Balance</p>
  <p className="mt-1 text-2xl font-bold">
    ₱{Number(currentBalance || 0).toLocaleString()}
  </p>
</div>

<input
  type="number"
  min="0"
  max={currentBalance}
  placeholder="Expected amount"
  value={form.amount_expected}
  onChange={(e) => {
    const value = Number(e.target.value);

    if (value > currentBalance) {
      setForm({
        ...form,
        amount_expected: String(currentBalance),
      });
      return;
    }

    setForm({
      ...form,
      amount_expected: e.target.value,
    });
  }}
  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A]"
/>

          <input
            type="date"
            value={form.due_date}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A]"
          />

          <textarea
            placeholder="Reminder note..."
            value={form.note}
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
            className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A]"
          />

          {contactNumber && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
              Also send SMS to borrower
            </label>
          )}

          <div className="flex gap-3">
            <button
              onClick={isClose}
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Reminder"}
            </button>
          </div>
        </div>
      </div>
      <GlobalModal
  isOpen={globalModal.isOpen}
  title={globalModal.title}
  message={globalModal.message}
  type={globalModal.type as any}
  onClose={() =>
    setGlobalModal({
      ...globalModal,
      isOpen: false,
    })
  }
/>
    </div>
    
  );
}