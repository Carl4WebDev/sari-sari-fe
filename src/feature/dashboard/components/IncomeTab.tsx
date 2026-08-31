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

const CATEGORY_STYLES: Record<string, { badge: string; icon: string }> = {
  RESTOCK: { badge: "bg-blue-50 text-blue-700 border-blue-200/70", icon: "📦" },
  UTILITIES: { badge: "bg-amber-50 text-amber-700 border-amber-200/70", icon: "⚡" },
  RENT: { badge: "bg-purple-50 text-purple-700 border-purple-200/70", icon: "🏠" },
  SALARY: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70", icon: "👥" },
  TRANSPORT: { badge: "bg-orange-50 text-orange-700 border-orange-200/70", icon: "🚚" },
  SUPPLIES: { badge: "bg-rose-50 text-rose-700 border-rose-200/70", icon: "🛍️" },
  OTHER: { badge: "bg-slate-100 text-slate-700 border-slate-200/70", icon: "🧾" },
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
      <div className="rounded-[2rem] border border-slate-200/90 bg-white p-12 text-center shadow-2xs space-y-3">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-50 text-slate-400 border border-slate-200/80 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h4 className="text-sm font-black text-slate-800">No Income Data Yet</h4>
        <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">{t("stats.no_data")}</p>
      </div>
    );
  }

  const incomeTotal = summary.income.total || 0;
  const expenseTotal = summary.expenses.total || 0;
  const profit = summary.profit || 0;
  const maxBar = Math.max(incomeTotal, expenseTotal, 1);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Period Toggle Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950 tracking-tight">
            Store Profit & Loss
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Monitor net earnings, sales income, and operational costs
          </p>
        </div>

        <div className="flex gap-1 rounded-2xl bg-slate-200/70 p-1.5 border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => onPeriodChange("week")}
            className={`rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "week"
                ? "bg-slate-900 text-white shadow-xs scale-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            }`}
          >
            {t("stats.this_week")}
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("month")}
            className={`rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "month"
                ? "bg-slate-900 text-white shadow-xs scale-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            }`}
          >
            {t("stats.this_month")}
          </button>
        </div>
      </div>

      {/* Net Profit Hero Card with Side-by-Side Quick Summary */}
      <div
        className={`relative overflow-hidden rounded-[2rem] p-6 sm:p-8 text-white shadow-xl border transition-all duration-300 ${
          profit >= 0
            ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 border-emerald-400/30"
            : "bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 border-rose-400/30"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100/90 block">
              {t("income.profit")}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              ₱{Math.abs(profit).toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-xs font-black border border-white/20 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${profit >= 0 ? "bg-emerald-300 animate-pulse" : "bg-rose-300 animate-pulse"}`} />
              <span>{profit >= 0 ? "Positive Net Profit" : "Net Loss / Negative"}</span>
            </div>
          </div>

          {/* Quick Metrics in Frosted Chips */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 p-3.5 sm:p-4 text-white min-w-[130px] sm:min-w-[150px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100/80 block">
                {t("income.total_income")}
              </span>
              <p className="text-lg sm:text-xl font-black text-white mt-0.5 truncate">
                ₱{incomeTotal.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 p-3.5 sm:p-4 text-white min-w-[130px] sm:min-w-[150px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100/80 block">
                {t("income.total_expenses")}
              </span>
              <p className="text-lg sm:text-xl font-black text-white mt-0.5 truncate">
                ₱{expenseTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Comparison Bars */}
      <div className="rounded-[2rem] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Income vs Expenses Comparison
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Visual ratio of cash inflows and outflows
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Income Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{t("income.total_income")}</span>
              </span>
              <span className="text-emerald-600">
                ₱{incomeTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 shadow-2xs"
                style={{ width: `${(incomeTotal / maxBar) * 100}%` }}
              />
            </div>
          </div>

          {/* Expenses Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>{t("income.total_expenses")}</span>
              </span>
              <span className="text-rose-500">
                ₱{expenseTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500 shadow-2xs"
                style={{ width: `${(expenseTotal / maxBar) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Income by Method & Expenses by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* Breakdown: Income by Method */}
        <div className="rounded-[2rem] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {t("income.by_method")}
                </h3>
                <p className="text-xs font-semibold text-slate-400">Payment channels</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600">
              {summary.income.by_method.length} {summary.income.by_method.length === 1 ? "method" : "methods"}
            </span>
          </div>

          {summary.income.by_method.length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              No payment transactions yet
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.income.by_method.map((m) => (
                <div
                  key={m.method}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-xs font-black">
                      ₱
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {METHOD_LABELS[m.method] || m.method}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-600">
                    ₱{Number(m.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakdown: Expenses by Category */}
        <div className="rounded-[2rem] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {t("income.by_category")}
                </h3>
                <p className="text-xs font-semibold text-slate-400">Expense distribution</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600">
              {summary.expenses.by_category.length} {summary.expenses.by_category.length === 1 ? "category" : "categories"}
            </span>
          </div>

          {summary.expenses.by_category.length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              No categorized expenses yet
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.expenses.by_category.map((c) => {
                const style = CATEGORY_STYLES[c.category] || CATEGORY_STYLES.OTHER;
                return (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-100/80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{style.icon}</span>
                      <span className={`rounded-xl px-2.5 py-0.5 text-xs font-black border ${style.badge}`}>
                        {t(`income.categories.${c.category}`)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-rose-500">
                      ₱{Number(c.total).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses List Card */}
      <div className="rounded-[2rem] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {t("income.recent_expenses")}
                </h3>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {expenses.length}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                Log of operating costs and stock purchases
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddExpense}
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-black shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{t("income.add_expense")}</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 sm:p-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">No Expenses Recorded Yet</p>
              <p className="text-xs font-semibold text-slate-400 mt-1 max-w-sm mx-auto">
                Add your store inventory, utilities, and daily operations to calculate accurate net profit.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {expenses.map((expense) => {
              const style = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.OTHER;
              return (
                <div
                  key={expense.expense_id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 hover:border-slate-300 hover:shadow-2xs transition"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-xl px-2.5 py-0.5 text-xs font-black border ${style.badge}`}>
                        {style.icon} {t(`income.categories.${expense.category}`)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(expense.expense_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="mt-1.5 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {expense.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs sm:text-sm font-black text-rose-500">
                      -₱{Number(expense.amount).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
                      <button
                        type="button"
                        onClick={() => onEditExpense(expense)}
                        className="h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center active:scale-95"
                        title="Edit Expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteExpense(expense.expense_id)}
                        className="h-8 w-8 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer flex items-center justify-center active:scale-95"
                        title="Delete Expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
