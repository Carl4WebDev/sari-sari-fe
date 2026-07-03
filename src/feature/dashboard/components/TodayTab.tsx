import { useTranslation } from "../../../shared/i18n/useTranslation";

interface TodayItem {
  transaction_id: number;
  type: "LOAN" | "PAYMENT";
  borrower_id: number;
  borrower_name: string;
  amount: number;
  payment_method: string | null;
  items: { product_name: string; quantity: number; price: number }[];
  created_at: string;
}

interface TodaySummary {
  total_lent: number;
  total_collected: number;
  net: number;
  transaction_count: number;
}

interface Props {
  summary: TodaySummary | null;
  transactions: TodayItem[];
}

export default function TodayTab({ summary, transactions }: Props) {
  const { t } = useTranslation();

  if (!summary || summary.transaction_count === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm text-gray-500">{t("dashboard.today.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-xs text-green-600">{t("dashboard.today.lent")}</p>
          <p className="mt-1 text-lg font-bold text-green-800">
            ₱{summary.total_lent.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-xs text-blue-600">{t("dashboard.today.collected")}</p>
          <p className="mt-1 text-lg font-bold text-blue-800">
            ₱{summary.total_collected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">{t("dashboard.today.net")}</p>
          <p className="mt-1 text-lg font-bold text-gray-800">
            ₱{summary.net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.transaction_id}
            className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm ${
              tx.type === "LOAN"
                ? "border-l-4 border-l-green-500"
                : "border-l-4 border-l-blue-500"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {tx.borrower_name}
              </p>
              <p className="text-xs text-gray-500">
                {tx.type === "LOAN"
                  ? tx.items.length === 1 && tx.items[0].product_name === "Cash loan"
                    ? t("dashboard.today.cash_loan")
                    : tx.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")
                  : tx.payment_method || "Payment"}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p
                className={`text-sm font-bold ${
                  tx.type === "LOAN" ? "text-[#1E3A8A]" : "text-[#16A34A]"
                }`}
              >
                {tx.type === "LOAN" ? "+" : "-"}₱{tx.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(tx.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
