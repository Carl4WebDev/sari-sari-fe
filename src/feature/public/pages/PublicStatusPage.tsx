import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { usePublicStatus } from "../../public/context/usePublicStatus";
import { useTranslation } from "../../../shared/i18n/useTranslation";

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
    return transactions.reduce((acc, txn) => {
      return txn.type === "LOAN"
        ? acc + Number(txn.amount)
        : acc - Number(txn.amount);
    }, 0);
  }, [transactions]);

  const lastPayment = transactions
    .filter((txn) => txn.type === "PAYMENT")
    .slice(-1)[0];

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
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-lg font-semibold text-[#1E3A8A]">
          {storeName}
        </h1>
        <p className="text-xs text-gray-500">{t("public.loan_status")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 space-y-3 text-center">
        {borrower.profile_image_url ? (
          <img
            src={borrower.profile_image_url}
            alt={borrower.name}
            className="mx-auto h-20 w-20 rounded-full object-cover border"
          />
        ) : (
          <div className="mx-auto h-20 w-20 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-2xl font-bold">
            {borrower.name?.charAt(0)}
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">{t("public.borrower")}</p>
          <p className="text-lg font-semibold text-gray-800">
            {borrower.name}
          </p>
        </div>
      </div>

      <div className="bg-[#1E3A8A] text-white rounded-xl p-6 text-center">
        <p className="text-sm text-blue-100">{t("public.total_balance")}</p>
        <p className="text-3xl font-bold mt-2">
          ₱{totalBalance.toLocaleString()}
        </p>
      </div>

      <button
        onClick={exportToExcel}
        className="w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white"
      >
        {t("public.export_excel")}
      </button>

      {lastPayment && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">{t("public.last_payment")}</p>
          <p className="text-sm font-medium text-[#16A34A]">
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
            className="bg-white rounded-xl p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between">
              <span
                className={`text-xs font-semibold ${
                  txn.type === "LOAN"
                    ? "text-[#1E3A8A]"
                    : "text-[#16A34A]"
                }`}
              >
                {txn.type}
              </span>

              <span className="text-xs text-gray-400">
                {normalizeDate(txn.date)}
              </span>
            </div>

            {txn.type === "LOAN" && txn.items && (
              <div className="text-sm text-gray-600 space-y-1">
                {txn.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.product}
                    </span>
                    <span>
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
                  txn.type === "LOAN"
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

      <div className="text-center text-xs text-gray-500 pt-6">
        {t("public.footer")}
      </div>
    </div>
  );
}