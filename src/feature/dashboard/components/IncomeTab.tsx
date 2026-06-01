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
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => onPeriodChange("week")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            period === "week"
              ? "bg-[#1E3A8A] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("stats.this_week")}
        </button>
        <button
          onClick={() => onPeriodChange("month")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            period === "month"
              ? "bg-[#1E3A8A] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("stats.this_month")}
        </button>
      </div>

      {/* Profit Hero Card */}
      <div
        className={`rounded-2xl p-5 text-white shadow-md ${
          profit >= 0
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
            : "bg-gradient-to-r from-red-600 to-red-500"
        }`}
      >
        <p className="text-sm font-medium opacity-90">{t("income.profit")}</p>
        <p className="mt-1 text-3xl font-bold">
          P{Math.abs(profit).toLocaleString()}
        </p>
        <p className="mt-1 text-sm opacity-75">
          {profit >= 0 ? "Positive" : "Negative"} {t("income.profit").toLowerCase()}
        </p>
      </div>

      {/* Income vs Expenses Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {t("income.total_income")}
              </span>
              <span className="font-semibold text-emerald-600">
                P{incomeTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(incomeTotal / maxBar) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {t("income.total_expenses")}
              </span>
              <span className="font-semibold text-red-500">
                P{expenseTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-red-400 transition-all"
                style={{ width: `${(expenseTotal / maxBar) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown: Income by Method */}
      {summary.income.by_method.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            {t("income.by_method")}
          </h3>
          <div className="space-y-2">
            {summary.income.by_method.map((m) => (
              <div key={m.method} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {METHOD_LABELS[m.method] || m.method}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  P{Number(m.total).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown: Expenses by Category */}
      {summary.expenses.by_category.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            {t("income.by_category")}
          </h3>
          <div className="space-y-2">
            {summary.expenses.by_category.map((c) => (
              <div
                key={c.category}
                className="flex items-center justify-between"
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    CATEGORY_COLORS[c.category] || CATEGORY_COLORS.OTHER
                  }`}
                >
                  {t(`income.categories.${c.category}`)}
                </span>
                <span className="text-sm font-semibold text-red-500">
                  P{Number(c.total).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            {t("income.recent_expenses")}
          </h3>
          <button
            onClick={onAddExpense}
            className="rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white"
          >
            + {t("income.add_expense")}
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            {t("income.no_expenses")}
          </p>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.expense_id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[expense.category] ||
                        CATEGORY_COLORS.OTHER
                      }`}
                    >
                      {t(`income.categories.${expense.category}`)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {expense.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-red-500">
                    P{Number(expense.amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onEditExpense(expense)}
                    className="text-xs text-[#1E3A8A] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteExpense(expense.expense_id)}
                    className="text-xs text-red-400 hover:underline"
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
