import { useEffect, useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";

const CATEGORIES = [
  "RESTOCK",
  "UTILITIES",
  "RENT",
  "SALARY",
  "TRANSPORT",
  "SUPPLIES",
  "OTHER",
];

interface Props {
  isOpen: boolean;
  isClose: () => void;
  onSubmit: (payload: {
    amount: number;
    category: string;
    description: string;
    expense_date: string;
  }) => Promise<any>;
  editExpense?: {
    expense_id: number;
    amount: number;
    category: string;
    description: string | null;
    expense_date: string;
  } | null;
}

export default function AddExpenseModal({
  isOpen,
  isClose,
  onSubmit,
  editExpense,
}: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "OTHER",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      if (editExpense) {
        setForm({
          amount: String(editExpense.amount),
          category: editExpense.category,
          description: editExpense.description || "",
          expense_date: editExpense.expense_date,
        });
      } else {
        setForm({
          amount: "",
          category: "OTHER",
          description: "",
          expense_date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, editExpense]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    setLoading(true);
    await onSubmit({
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      expense_date: form.expense_date,
    });
    setLoading(false);
    isClose();
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
            <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                {editExpense ? "Edit Expense" : t("income.add_expense")}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Record store expenditures</p>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="mb-1.5 block text-[11px] font-black text-slate-500">
              Amount (₱)
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black text-slate-500">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`income.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black text-slate-500">
              Date
            </label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) =>
                setForm({ ...form, expense_date: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black text-slate-500">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g., Bought 10 cases of Coke"
              rows={2}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={isClose}
            className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.amount || Number(form.amount) <= 0}
            className="flex-1 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : editExpense ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
