import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { usePublicStatus } from "../../public/context/usePublicStatus";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";


interface LoanItem {
  product: string;
  quantity: number;
  price: number;
}

interface Transaction {
  id: number;
  type: "LOAN" | "PAYMENT";
  date: string;
  items?: LoanItem[];
  amount: number;
  voided?: boolean;
  voided_at?: string;
  void_reason?: string;
}

export default function PublicStatusPage() {
  const { t } = useTranslation();
  const { token } = useParams();

  const {
    statusData,
    loading,
    error,
    getPublicStatus,
    clearStatusData,
  } = usePublicStatus();

  useEffect(() => {
    if (token) getPublicStatus(token);

    return () => {
      clearStatusData();
    };
  }, [token]);

  const storeName = statusData?.store?.name || "";
  const borrower = statusData?.borrower || null;
  const transactions: Transaction[] = statusData?.transactions || [];

  const normalizeDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const totalBalance = useMemo(() => {
    return transactions
      .filter((txn) => !txn.voided)
      .reduce((acc, txn) => {
        return txn.type === "LOAN"
          ? acc + Number(txn.amount)
          : acc - Number(txn.amount);
      }, 0);
  }, [transactions]);

  const lastPayment = transactions
    .filter((txn) => txn.type === "PAYMENT" && !txn.voided)
    .slice(-1)[0];

  const exportToPDF = async () => {
    const activeTxns = transactions.filter((txn) => !txn.voided);
    const { generateTransactionsPDF } = await import("../../../shared/utils/exportToPDF");
    generateTransactionsPDF(
      borrower?.name || "",
      activeTxns.map((txn, i, arr) => {
        let runningBalance = 0;
        for (let j = arr.length - 1; j >= i; j--) {
          runningBalance += arr[j].type === "LOAN" ? Number(arr[j].amount) : -Number(arr[j].amount);
        }
        return { ...txn, runningBalance };
      }),
      totalBalance,
      storeName,
    );
  };

  const exportToExcel = () => {
    const rows = [
      ["Store", storeName],
      ["Borrower", borrower?.name || ""],
      ["Current Balance", totalBalance],
      [],
      ["Type", "Date", "Product", "Quantity", "Price", "Amount"],
    ];

    transactions.forEach((t) => {
      if (t.type === "LOAN" && t.items?.length) {
        t.items.forEach((item) => {
          rows.push([
            t.type,
            normalizeDate(t.date),
            item.product,
            item.quantity,
            item.price,
            Number(item.quantity) * Number(item.price),
          ]);
        });
      } else {
        rows.push([
          t.type,
          normalizeDate(t.date),
          "",
          "",
          "",
          t.amount,
        ]);
      }
    });

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${borrower?.name || "loan-status"}-transactions.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        {t("public.loading")}
      </div>
    );
  }

  if (error || !borrower) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h1 className="font-semibold text-gray-800">{t("public.not_found")}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {t("public.invalid_link")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 font-sans selection:bg-blue-900 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 py-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">
            {storeName}
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-500">{t("public.loan_status")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4 text-center flex flex-col items-center justify-center">
            {borrower.profile_image_url ? (
              <img
                src={resolveImageUrl(borrower.profile_image_url)}
                alt={borrower.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-blue-900 shadow-md"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-900 text-white flex items-center justify-center text-3xl font-extrabold shadow-md">
                {borrower.name?.charAt(0)}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("public.borrower")}</p>
              <p className="text-xl md:text-2xl font-extrabold text-slate-900">
                {borrower.name}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-800 flex flex-col items-center justify-center space-y-2">
            <p className="text-xs md:text-sm font-bold text-blue-400 uppercase tracking-wider">{t("public.total_balance")}</p>
            <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              ₱{totalBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={exportToExcel}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs md:text-sm font-extrabold text-white shadow-xs transition cursor-pointer"
          >
            {t("common.export_csv")}
          </button>
          <button
            onClick={exportToPDF}
            className="rounded-2xl bg-rose-600 hover:bg-rose-700 py-3.5 text-xs md:text-sm font-extrabold text-white shadow-xs transition cursor-pointer"
          >
            {t("common.export_pdf")}
          </button>
        </div>

        {lastPayment && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("public.last_payment")}</p>
            <p className="text-base font-extrabold text-emerald-600 mt-1">
              ₱{Number(lastPayment.amount).toLocaleString()} on{" "}
              {normalizeDate(lastPayment.date)}
            </p>
          </div>
        )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          {t("public.transaction_history")}
        </h2>

        {transactions.length === 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm text-sm text-gray-500">
            {t("public.no_transactions")}
          </div>
        )}

        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={`rounded-xl p-4 shadow-sm space-y-2 ${
              txn.voided ? "bg-red-50 border border-red-200 opacity-75" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${
                    txn.voided
                      ? "text-gray-400 line-through"
                      : txn.type === "LOAN"
                        ? "text-[#1E3A8A]"
                        : "text-[#16A34A]"
                  }`}
                >
                  {txn.type}
                </span>
                {txn.voided && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    {t("details.voided")}
                  </span>
                )}
              </div>

              <span className={`text-xs ${txn.voided ? "text-gray-400" : "text-gray-400"}`}>
                {normalizeDate(txn.date)}
              </span>
            </div>

            {txn.voided && (
              <p className="text-xs text-red-400 italic">
                {t("public.voided_notice")}
              </p>
            )}

            {txn.type === "LOAN" && txn.items && (
              <div className={`text-sm space-y-1 ${txn.voided ? "text-gray-400" : "text-gray-600"}`}>
                {txn.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className={txn.voided ? "line-through" : ""}>
                      {item.quantity} × {item.product}
                    </span>
                    <span className={txn.voided ? "line-through" : ""}>
                      ₱
                      {(
                        Number(item.quantity) * Number(item.price)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <span
                className={`text-sm font-bold ${
                  txn.voided
                    ? "text-gray-400 line-through"
                    : txn.type === "LOAN"
                      ? "text-[#1E3A8A]"
                      : "text-[#16A34A]"
                }`}
              >
                {txn.type === "LOAN" ? "+" : "-"}₱
                {Number(txn.amount).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-slate-400 font-semibold pt-6">
        {t("public.footer")}
      </div>
    </div>
    </div>
  );
}