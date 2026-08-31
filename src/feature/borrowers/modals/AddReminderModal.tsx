import { useEffect, useState } from "react";

import GlobalModal from "../../../shared/components/GlobalModal";
import { sendCollectionReminderEmail } from "../../../shared/utils/sendEmail";
import { sendNativeSMS, buildReminderSMS, canSendSMS } from "../../../shared/utils/sendSMS";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrowerId: number;
  currentBalance: number;
  contactNumber?: string | null;
  borrowerEmail?: string | null;
  borrowerName?: string;
  storeName?: string;
  onCreateReminder: (payload: any) => Promise<any>;
}

export default function AddReminderModal({
  isOpen,
  isClose,
  borrowerId,
  currentBalance,
  contactNumber,
  borrowerEmail,
  borrowerName,
  storeName,
  onCreateReminder,
}: Props) {
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);


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
      send_email: sendEmail,
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
      if (sendEmail && borrowerEmail) {
        await sendCollectionReminderEmail({
          borrowerEmail,
          borrowerName: borrowerName || "Customer",
          amount: Number(form.amount_expected || 0),
          dueDate: form.due_date,
          storeName: storeName || "Listahub",
        });
      }

      if (sendSMS && contactNumber) {
        const message = buildReminderSMS({
          firstName: borrowerName || "Customer",
          storeName: storeName || "Store",
          amount: Number(form.amount_expected || 0),
          dueDate: form.due_date,
        });
        sendNativeSMS(contactNumber, message);
      }

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
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                Add Collection Reminder
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Set payment schedule</p>
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

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-md">
            <p className="text-xs font-bold text-slate-400">Current Balance</p>
            <p className="mt-1 text-2xl font-black">
              ₱{Number(currentBalance || 0).toLocaleString()}
            </p>
          </div>

          <input
            type="number"
            min="0"
            max={currentBalance}
            placeholder="Expected amount (₱)"
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
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
          />

          <input
            type="date"
            value={form.due_date}
            onChange={(e) =>
              setForm({ ...form, due_date: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition outline-none"
          />

          <textarea
            placeholder="Reminder note..."
            value={form.note}
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
            rows={3}
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition resize-none"
          />

          {borrowerEmail && (
            <label className="flex items-center gap-2.5 text-xs font-extrabold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              Also send email to borrower
            </label>
          )}

          {contactNumber && (
            canSendSMS() ? (
              <label className="flex items-center gap-2.5 text-xs font-extrabold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSMS}
                  onChange={(e) => setSendSMS(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                />
                {t("sms.auto_send")}
              </label>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs font-bold text-amber-700">
                <span>{t("sms.mobile_only")}</span>
              </div>
            )
          )}
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
            className="flex-1 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save Reminder"}
          </button>
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