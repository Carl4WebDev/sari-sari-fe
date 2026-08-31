import { useTranslation } from "../../../shared/i18n/useTranslation";

interface IncomeByMethod {
  method: string;
  total: number;
}

interface ExpenseByCategory {
  category: string;
  total: number;
}

interface IncomeSummary {
  income: { total: number; by_method: IncomeByMethod[] };
  expenses: { total: number; by_category: ExpenseByCategory[] };
  profit: number;
  period: string;
}

interface Expense {
  expense_id: number;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  created_at: string;
}

interface Props {
  summary: IncomeSummary | null;
  expenses: Expense[];
  period: "week" | "month";
  onPeriodChange: (period: "week" | "month") => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  RESTOCK: "bg-blue-100 text-blue-700",
  UTILITIES: "bg-yellow-100 text-yellow-700",
  RENT: "bg-purple-100 text-purple-700",
  SALARY: "bg-green-100 text-green-700",
  TRANSPORT: "bg-orange-100 text-orange-700",
  SUPPLIES: "bg-pink-100 text-pink-700",
  OTHER: "bg-gray-100 text-gray-700",
};

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  GCASH: "GCash",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
};

export default function IncomeTab({
  summary,
  expenses,
  period,
  onPeriodChange,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: Props) {
  const { t } = useTranslation();

  if (!summary) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-400">{t("stats.no_data")}</p>
      </div>
    );
  }

  const incomeTotal = summary.income.total;
  const expenseTotal = summary.expenses.total;
  const profit = summary.profit;
  const maxBar = Math.max(incomeTotal, expenseTotal, 1);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Period Toggle */}
      <div className="flex justify-center">
        <div className="flex gap-1 rounded-2xl bg-slate-200/60 p-1 border border-slate-200/90">
          <button
            onClick={() => onPeriodChange("week")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "week"
                ? "bg-slate-950 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {t("stats.this_week")}
          </button>
          <button
            onClick={() => onPeriodChange("month")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "month"
                ? "bg-slate-950 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {t("stats.this_month")}
          </button>
        </div>
      </div>

      {/* Profit Hero Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl border ${
          profit >= 0
            ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-400/30"
            : "bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 border-rose-400/30"
        }`}
      >
        <div className="relative z-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 block">
            {t("income.profit")}
          </span>
          <p className="mt-1 text-3xl sm:text-4xl font-black text-white tracking-tight">
            ₱{Math.abs(profit).toLocaleString()}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-black border border-white/20">
            <span className={`w-2 h-2 rounded-full ${profit >= 0 ? "bg-emerald-300 animate-pulse" : "bg-rose-300 animate-pulse"}`} />
            <span>{profit >= 0 ? "Positive" : "Negative"} {t("income.profit").toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Progress Bar Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex justify-between text-xs sm:text-sm font-black">
              <span className="text-slate-700">
                {t("income.total_income")}
              </span>
              <span className="text-emerald-600">
                ₱{incomeTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 shadow-xs"
                style={{ width: `${(incomeTotal / maxBar) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs sm:text-sm font-black">
              <span className="text-slate-700">
                {t("income.total_expenses")}
              </span>
              <span className="text-rose-500">
                ₱{expenseTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500 shadow-xs"
                style={{ width: `${(expenseTotal / maxBar) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Income by Method & Expenses by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Breakdown: Income by Method */}
        {summary.income.by_method.length > 0 && (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {t("income.by_method")}
            </h3>
            <div className="space-y-2.5">
              {summary.income.by_method.map((m) => (
                <div key={m.method} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                    {METHOD_LABELS[m.method] || m.method}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-600">
                    ₱{Number(m.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown: Expenses by Category */}
        {summary.expenses.by_category.length > 0 && (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {t("income.by_category")}
            </h3>
            <div className="space-y-2.5">
              {summary.expenses.by_category.map((c) => (
                <div
                  key={c.category}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <span
                    className={`rounded-xl px-2.5 py-1 text-xs font-extrabold border ${
                      CATEGORY_COLORS[c.category] || CATEGORY_COLORS.OTHER
                    }`}
                  >
                    {t(`income.categories.${c.category}`)}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-rose-500">
                    ₱{Number(c.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expenses List Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            {t("income.recent_expenses")}
          </h3>
          <button
            onClick={onAddExpense}
            className="rounded-xl bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-2 text-xs font-black shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{t("income.add_expense")}</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="py-8 text-center text-xs sm:text-sm font-semibold text-slate-400">
            {t("income.no_expenses")}
          </p>
        ) : (
          <div className="space-y-2.5">
            {expenses.map((expense) => (
              <div
                key={expense.expense_id}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 hover:border-slate-300 transition"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-xl px-2.5 py-0.5 text-xs font-extrabold border ${
                        CATEGORY_COLORS[expense.category] ||
                        CATEGORY_COLORS.OTHER
                      }`}
                    >
                      {t(`income.categories.${expense.category}`)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-700 truncate">
                      {expense.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-black text-rose-500">
                    ₱{Number(expense.amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onEditExpense(expense)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer text-xs font-extrabold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteExpense(expense.expense_id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer text-xs font-extrabold"
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
