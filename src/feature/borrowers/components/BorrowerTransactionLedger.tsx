import { useState, useMemo, useRef } from "react";
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
  payment_method?: string;
  payment_note?: string;
  voided?: boolean;
  voided_at?: string;
  void_reason?: string;
}

interface BorrowerTransactionLedgerProps {
  borrower: {
    borrower_id: number;
    first_name: string;
    last_name: string;
  };
  transactions: Transaction[];
  totalBalance: number;
  isOnline: boolean;
  onVoidTransaction: (borrowerId: number, txnId: number, reason?: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 3;

export default function BorrowerTransactionLedger({
  borrower,
  transactions,
  totalBalance,
  isOnline,
  onVoidTransaction,
}: BorrowerTransactionLedgerProps) {
  const { t } = useTranslation();

  const [dateFilter, setDateFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [voidModal, setVoidModal] = useState<{
    isOpen: boolean;
    txn: Transaction | null;
  }>({ isOpen: false, txn: null });

  const [voidReasonInput, setVoidReasonInput] = useState("");
  const voidReasonRef = useRef("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchDate = dateFilter ? txn.date === dateFilter : true;

      const matchProduct =
        txn.type === "LOAN" && productFilter
          ? txn.items?.some((i) =>
              i.product.toLowerCase().includes(productFilter.toLowerCase())
            )
          : true;

      return matchDate && matchProduct;
    });
  }, [transactions, dateFilter, productFilter]);

  const ledgerTransactions = useMemo(() => {
    let runningBalance = 0;
    const withBalance: any[] = [];

    for (let i = filteredTransactions.length - 1; i >= 0; i--) {
      const txn = filteredTransactions[i];

      if (txn.voided) {
        withBalance[i] = { ...txn, runningBalance: null };
      } else {
        runningBalance =
          txn.type === "LOAN"
            ? runningBalance + Number(txn.amount)
            : runningBalance - Number(txn.amount);
        withBalance[i] = { ...txn, runningBalance };
      }
    }

    return withBalance;
  }, [filteredTransactions]);

  const totalPages = Math.ceil(ledgerTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    return ledgerTransactions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [ledgerTransactions, currentPage]);

  const handleExportCSV = () => {
    const headers = ["Type", "Date", "Items", "Loan", "Payment", "Running Balance", "Status"];

    const rows = ledgerTransactions.map((txn: any) => {
      const items = txn.items?.length
        ? txn.items.map((i: any) => `${i.product} x${i.quantity}`).join("; ")
        : "";

      return [
        txn.type,
        txn.date,
        items,
        txn.type === "LOAN" ? txn.amount : "",
        txn.type === "PAYMENT" ? txn.amount : "",
        txn.voided ? "VOIDED" : (txn.runningBalance || 0),
        txn.voided ? "VOIDED" : "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${borrower.first_name}-${borrower.last_name}-transactions.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { generateTransactionsPDF } = await import("../../../shared/utils/exportToPDF");
    generateTransactionsPDF(
      `${borrower.first_name} ${borrower.last_name}`,
      ledgerTransactions,
      totalBalance,
      user.store_name || ""
    );
  };

  const handleConfirmVoid = async () => {
    if (!voidModal.txn) return;
    const txn = voidModal.txn;
    setVoidModal({ isOpen: false, txn: null });
    await onVoidTransaction(borrower.borrower_id, txn.id, voidReasonRef.current || undefined);
  };

  return (
    <div className="space-y-4">
      {/* Filters & Export Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center pt-2">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition shadow-2xs cursor-pointer"
        />

        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            placeholder={t("details.filter_product")}
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200/90 bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-black px-4 py-3 flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t("common.export_csv")}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-black px-4 py-3 flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{t("common.export_pdf")}</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4 pb-8">
        {paginatedTransactions.length === 0 ? (
          <div className="rounded-3xl bg-slate-50/60 border border-slate-200/80 p-8 text-center space-y-2">
            <p className="text-xs font-black text-slate-700">No transactions match your search or filter.</p>
          </div>
        ) : (
          paginatedTransactions.map((txn) => (
            <div
              key={txn.id}
              className={`rounded-3xl border bg-white p-5 sm:p-6 shadow-2xs space-y-4 transition ${
                txn.voided
                  ? "border-rose-200 bg-rose-50/20 opacity-75"
                  : "border-slate-200/90 hover:border-slate-300"
              }`}
            >
              {/* Transaction Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-2xs ${
                      txn.voided
                        ? "bg-slate-100 text-slate-400 line-through"
                        : txn.type === "LOAN"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                    }`}
                  >
                    {txn.type === "LOAN" ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>{txn.type}</span>
                  </span>

                  <span className="text-xs font-bold text-slate-400">{txn.date}</span>

                  {txn.voided && (
                    <span className="rounded-xl bg-rose-100/80 px-2.5 py-0.5 text-[11px] font-black text-rose-700 border border-rose-200">
                      {t("details.voided")}
                    </span>
                  )}
                </div>

                {!txn.voided && isOnline && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoidReasonInput("");
                      voidReasonRef.current = "";
                      setVoidModal({ isOpen: true, txn });
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/80 px-3 py-1 text-xs font-black text-rose-600 transition cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{t("details.void")}</span>
                  </button>
                )}
              </div>

              {txn.voided && txn.voided_at && (
                <p className="text-xs text-rose-500 font-bold">
                  {t("details.voided_on", { date: txn.voided_at.split("T")[0] })}
                </p>
              )}

              {txn.voided && txn.void_reason && (
                <p className="text-xs text-slate-500 font-medium">
                  {t("details.void_reason_label")} {txn.void_reason}
                </p>
              )}

              {/* Payment Specific Details */}
              {txn.type === "PAYMENT" && (
                <div
                  className={`rounded-2xl border p-4 space-y-1.5 ${
                    txn.voided
                      ? "border-slate-200 bg-slate-50"
                      : "border-emerald-100/80 bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {t("details.payment_method")}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        txn.voided ? "text-slate-400 bg-slate-200" : "text-emerald-700 bg-emerald-100"
                      }`}
                    >
                      {txn.payment_method || "CASH"}
                    </span>
                  </div>
                  {txn.payment_note && (
                    <p className={`text-xs font-semibold ${txn.voided ? "text-slate-400" : "text-slate-600"}`}>
                      "{txn.payment_note}"
                    </p>
                  )}
                </div>
              )}

              {/* Loan Specific Items List */}
              {txn.type === "LOAN" && txn.items && (
                <div
                  className={`rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-xs ${
                    txn.voided ? "text-slate-400" : "text-slate-700"
                  }`}
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200/60 flex justify-between">
                    <span>Item Details</span>
                    <span>Subtotal</span>
                  </div>
                  {txn.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between font-bold items-center py-0.5">
                      <span className={`flex items-center gap-2 ${txn.voided ? "line-through text-slate-400" : "text-slate-900"}`}>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-black">
                          {item.quantity}×
                        </span>
                        <span>{item.product}</span>
                      </span>
                      <span className={txn.voided ? "line-through text-slate-400" : "text-blue-950 font-black"}>
                        ₱{(item.quantity * item.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Running Balance & Amount Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold ${
                    txn.voided ? "bg-rose-50 border border-rose-100" : "bg-slate-50 border border-slate-100"
                  }`}
                >
                  <span className={txn.voided ? "text-rose-500" : "text-slate-400 uppercase tracking-wider text-[11px]"}>
                    {t("details.running_balance")}:
                  </span>
                  <span className={`font-black ${txn.voided ? "text-rose-500" : "text-slate-950"}`}>
                    {txn.voided
                      ? `(${t("details.excluded")})`
                      : `₱${Number(txn.runningBalance || 0).toLocaleString()}`}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xl font-black ${
                      txn.voided
                        ? "text-slate-400 line-through"
                        : txn.type === "LOAN"
                          ? "text-slate-950"
                          : "text-emerald-600"
                    }`}
                  >
                    {txn.type === "LOAN" ? "+" : "-"}₱{txn.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`h-9 w-9 rounded-2xl text-xs font-black transition cursor-pointer ${
                currentPage === index + 1
                  ? "bg-slate-950 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Void Modal */}
      {voidModal.isOpen && voidModal.txn && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden text-center animate-modal-pop">
            <h2 className="text-base font-black text-slate-950 tracking-tight">{t("details.void_transaction")}</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">
              {t("details.confirm_void", {
                type: voidModal.txn.type,
                amount: voidModal.txn.amount.toLocaleString(),
              })}
            </p>
            <textarea
              value={voidReasonInput}
              onChange={(e) => {
                setVoidReasonInput(e.target.value);
                voidReasonRef.current = e.target.value;
              }}
              placeholder={t("details.void_reason_placeholder")}
              className="mt-3 w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 resize-none transition"
              rows={2}
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setVoidModal({ isOpen: false, txn: null })}
                className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.cancel")}
              </button>
              <button
                onClick={handleConfirmVoid}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
