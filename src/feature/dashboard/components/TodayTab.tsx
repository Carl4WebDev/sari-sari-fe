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

export default function TodayTab({ summary, transactions = [] }: Props) {
  const { t } = useTranslation();

  const totalLent = summary?.total_lent ?? transactions.filter(t => t.type === "LOAN").reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalCollected = summary?.total_collected ?? transactions.filter(t => t.type === "PAYMENT").reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const net = summary?.net ?? (totalCollected - totalLent);
  const hasTransactions = transactions && transactions.length > 0;

  if (!hasTransactions && (!summary || summary.transaction_count === 0)) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-10 md:p-14 text-center shadow-xs space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
          <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">{t("dashboard.today.empty")}</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-sm mx-auto mt-1">
            I-click ang "+ Borrower" o "+ Loan" button sa taas para maka-record og unang utang o bayad sa tindahan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* Lent Today Card */}
        <div className="rounded-3xl bg-emerald-50/70 border border-emerald-200/90 p-5 text-center shadow-2xs hover:shadow-md transition">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
            {t("dashboard.today.lent")}
          </span>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            ₱{totalLent.toLocaleString()}
          </p>
        </div>

        {/* Collected Card */}
        <div className="rounded-3xl bg-blue-50/70 border border-blue-200/90 p-5 text-center shadow-2xs hover:shadow-md transition">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block">
            {t("dashboard.today.collected")}
          </span>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
            ₱{totalCollected.toLocaleString()}
          </p>
        </div>

        {/* Net Balance Dark Navy Card */}
        <div className="rounded-3xl bg-slate-950 text-white p-5 text-center shadow-xl border border-slate-800">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
            {t("dashboard.today.net")}
          </span>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
            ₱{net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="space-y-2.5">
        {transactions.map((tx, idx) => {
          const amt = Number(tx.amount || (tx as any).total_amount || 0);
          const borrowerName =
            tx.borrower_name ||
            (tx as any).name ||
            ((tx as any).first_name ? `${(tx as any).first_name} ${(tx as any).last_name}` : "Borrower");
          const dateStr = tx.created_at || (tx as any).transaction_date || new Date().toISOString();
          const itemsList = tx.items || [];
          const isLoan = tx.type === "LOAN";

          return (
            <div
              key={tx.transaction_id || idx}
              className="group flex items-center justify-between rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    isLoan ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}
                >
                  {isLoan ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                    {borrowerName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                    {isLoan
                      ? itemsList.length === 1 && itemsList[0]?.product_name === "Cash loan"
                        ? t("dashboard.today.cash_loan")
                        : itemsList.length > 0
                        ? itemsList.map((i) => `${i.product_name} x${i.quantity}`).join(", ")
                        : "General Loan"
                      : tx.payment_method || "Payment"}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                <p
                  className={`text-sm sm:text-base font-black tracking-tight ${
                    isLoan ? "text-slate-900" : "text-emerald-600"
                  }`}
                >
                  {isLoan ? "+" : "-"}₱{amt.toLocaleString()}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  {new Date(dateStr).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
