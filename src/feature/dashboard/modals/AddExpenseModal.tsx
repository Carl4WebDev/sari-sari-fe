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
  const [animate, setAnimate] = useState(false);
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
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
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
      className={`fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24 transition-opacity duration-200 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      onClick={isClose}
    >
      <div
        className={`mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-transform duration-200 ${
          animate ? "translate-y-0" : "-translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-[#1E3A8A]">
          {editExpense ? "Edit Expense" : t("income.add_expense")}
        </h2>

        <div className="space-y-3">
          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount (P)
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`income.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) =>
                setForm({ ...form, expense_date: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g., Bought 10 cases of Coke"
              rows={2}
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={isClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.amount || Number(form.amount) <= 0}
            className="flex-1 rounded-lg bg-[#1E3A8A] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : editExpense ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
