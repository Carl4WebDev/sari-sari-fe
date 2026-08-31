import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";

import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";
import { sendNativeSMS, buildReminderSMS, canSendSMS } from "../../../shared/utils/sendSMS";

import AddPaymentModal from "../modals/AddPaymentModal";
import AddLoanModalBorrowerDetails from "../modals/AddLoanModalBorrowerDetails";
import EditLoanModal from "../modals/EditLoanModal";
import AddReminderModal from "../modals/AddReminderModal";
import EditBorrowerModal from "../modals/EditBorrowerModal";

import { useCollectionReminder } from "../../context/collection-reminders/useCollectionReminder";
import { usePayment } from "../../context/payments/usePayment";
import GlobalModal from "../../../shared/components/GlobalModal";
import SuccessToast from "../../../shared/components/SuccessToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";

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

interface Note {
  id: number;
  message: string;
  date: string;
}

const ITEMS_PER_PAGE = 3;

export default function BorrowerDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const [isEditBorrowerOpen, setIsEditBorrowerOpen] = useState(false);

  const [globalModal, setGlobalModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
});

const [confirmModal, setConfirmModal] = useState<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  showReasonInput?: boolean;
}>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

const [voidReasonInput, setVoidReasonInput] = useState("");
const voidReasonRef = useRef("");


  const [dateFilter, setDateFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [noteInput, setNoteInput] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
const [editingNoteText, setEditingNoteText] = useState("");

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<{
    id: number;
    borrowerId: number;
    items: any[];
  } | null>(null);

  const {
    borrowers,
    transactions,
    fetchBorrowers,
    fetchBorrowerTransactions,
    loading,
    updatePublicLoanAccess,
    archiveBorrower,
    borrowerNotes,
    fetchBorrowerNotes,
    createBorrowerNote,
    updateBorrowerNote,
    deleteBorrowerNote,
    voidTransaction,
    error: borrowerError,
    clearError: clearBorrowerError,
  } = useBorrower();

  const {
  borrowerReminders,
  createReminder,
  fetchBorrowerReminders,
  error: reminderError,
  clearError: clearReminderError,
} = useCollectionReminder();

const { createPayment } = usePayment();

const [successToast, setSuccessToast] = useState<{
  isOpen: boolean;
  amount: number;
  borrowerName: string;
  newBalance: number;
}>({ isOpen: false, amount: 0, borrowerName: "", newBalance: 0 });

const [quickPayLoading, setQuickPayLoading] = useState<number | null>(null);

const handleQuickPay = (amount: number) => {
  if (!id) return;

  const borrowerName = `${borrower.first_name} ${borrower.last_name}`;
  const newBalance = totalBalance - amount;

  setConfirmModal({
    isOpen: true,
    title: t("details.confirm_payment"),
    message: t("details.quick_pay_message", {
      amount: amount.toLocaleString(),
      name: borrowerName,
      currentBalance: totalBalance.toLocaleString(),
      newBalance: Math.max(0, newBalance).toLocaleString(),
    }),
    onConfirm: async () => {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setQuickPayLoading(amount);

      const payOptions = isPending && borrower?._queuedItemId
        ? { dependsOn: borrower._queuedItemId, dependencyField: "borrower_id" }
        : {};

      const res = await createPayment({
        borrower_id: Number(id),
        amount,
        payment_type: "CASH",
        note: "",
      }, payOptions);

      if (res?.ok) {
        // Refresh is best-effort — don't crash if offline
        try {
          await refreshBorrowerDetails();
        } catch (e) {
          console.warn("[QuickPay] Refresh failed (likely offline):", e);
        }
        setSuccessToast({
          isOpen: true,
          amount,
          borrowerName,
          newBalance,
        });
      }

      setQuickPayLoading(null);
    },
  });
};

  useEffect(() => {
    if (location.state?.openPayment) {
      setIsPaymentModalOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    const err = borrowerError || reminderError;
    if (err) {
      setGlobalModal({
        isOpen: true,
        title: t("common.error"),
        message: err,
        type: "error",
      });
    }
  }, [borrowerError, reminderError]);
  
  const totalBalance = useMemo(() => {
    return transactions
      .filter((txn) => !txn.voided)
      .reduce((acc, txn) => {
        return txn.type === "LOAN" ? acc + txn.amount : acc - txn.amount;
      }, 0);
  }, [transactions]);

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
  const withBalance = [];

  for (let i = filteredTransactions.length - 1; i >= 0; i--) {
    const t = filteredTransactions[i];

    if (t.voided) {
      withBalance[i] = { ...t, runningBalance: null };
    } else {
      runningBalance =
        t.type === "LOAN"
          ? runningBalance + Number(t.amount)
          : runningBalance - Number(t.amount);
      withBalance[i] = { ...t, runningBalance };
    }
  }

  return withBalance;
}, [filteredTransactions]);

useEffect(() => {
  if (!id) return;

  // Skip API calls for temp/pending borrowers (offline-created, not yet synced)
  const isTempBorrower = Number(id) > 2147483647;
  if (isTempBorrower) return;

  clearBorrowerError();
  clearReminderError();
  fetchBorrowerTransactions(id);
  fetchBorrowerNotes(id);
  fetchBorrowerReminders(id);
}, [id]);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const borrower = useMemo(() => {
    if (!borrowers) return null;
    return borrowers.find((b: any) => String(b.borrower_id) === String(id));
  }, [borrowers, id]);

const totalPages = Math.ceil(ledgerTransactions.length / ITEMS_PER_PAGE);
const paginatedTransactions = useMemo(() => ledgerTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [ledgerTransactions, currentPage]);

if (!borrower) {
  return <div className="p-6 text-gray-500">{t("details.loading")}</div>;
}

// Check if this is a temp/pending borrower (created offline, not synced yet)
const isPending = borrower._pending || Number(borrower.borrower_id) > 2147483647;

  const borrowerAdapter = {
    id: borrower.borrower_id,
    fName: borrower.first_name,
    lName: borrower.last_name,
    age: calculateAge(borrower.dob),
    contact: borrower.contact_number,
    profileImageUrl: resolveImageUrl(borrower.profile_image_url)
  };

  const profileImageUrl = resolveImageUrl(borrower.profile_image_url);

const balance = Number(totalBalance || 0);

const paymentStatus =
  balance <= 0 ? t("details.fully_paid") : t("details.with_balance");

const paymentStatusColor =
  balance <= 0
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

const activityStatus =
  borrower.is_active
    ? t("details.active")
    : t("details.archived");

const activityStatusColor =
  borrower.is_active
    ? "bg-blue-100 text-blue-700"
    : "bg-gray-200 text-gray-700";

  const isPublicEnabled = borrower.token_enabled;
const publicToken = borrower.public_token;

const publicStatusLink = publicToken
  ? `${window.location.origin}/status/${publicToken}`
  : "";

const handleAddNote = async () => {
  if (!noteInput.trim() || !id) return;

  const res = await createBorrowerNote(
    id,
    noteInput
  );

  if (res?.ok) {
    setNoteInput("");
  }
};
const handleUpdateNote = async () => {
  if (!id || !editingNoteId || !editingNoteText.trim()) return;

  const res = await updateBorrowerNote(
    id,
    editingNoteId,
    editingNoteText
  );

  if (res?.ok) {
    setEditingNoteId(null);
    setEditingNoteText("");
  }
};

const handleDeleteNote = (noteId: number) => {
  if (!id) return;

  setConfirmModal({
    isOpen: true,
    title: t("details.delete"),
    message: t("details.confirm_delete_note"),
    onConfirm: async () => {
      await deleteBorrowerNote(id, noteId);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    },
  });
};

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
      user.store_name || "",
    );
  };

  const refreshBorrowerDetails = async () => {
  if (!id) return;

  // Skip API calls for temp/pending borrowers
  if (Number(id) > 2147483647) {
    await fetchBorrowers();
    return;
  }

  try {
    await fetchBorrowerTransactions(id);
    await fetchBorrowerNotes(id);
    await fetchBorrowerReminders(id);
  } catch (e) {
    console.warn("[BorrowerDetails] Refresh failed:", e);
  }
  await fetchBorrowers();
};

  return (
    <div className="space-y-6 pb-32">
      {isPending && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-xs font-bold text-amber-800">
          This borrower is being synced. Transaction history will appear once the sync completes.
        </div>
      )}

      {!isOnline && !isPending && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200/80 px-4 py-3 text-xs font-bold text-blue-700 flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 010-12.728M5.636 5.636L3 3m2.636 2.636l2.829 2.829m-2.829-2.829A5 5 0 004.5 12c0 1.25.452 2.395 1.207 3.284" />
          </svg>
          <span>Offline — viewing cached data. Add Loan and Add Payment still available.</span>
        </div>
      )}

      <EditBorrowerModal
        isOpen={isEditBorrowerOpen}
        isClose={() => setIsEditBorrowerOpen(false)}
        borrower={borrower}
        onBorrowerUpdated={async () => {
          await fetchBorrowers();
        }}
      />

      <AddLoanModalBorrowerDetails
        isOpen={isLoanModalOpen}
        isClose={() => setIsLoanModalOpen(false)}
        borrowerId={borrower.borrower_id}
        borrowerName={`${borrower.first_name} ${borrower.last_name}`}
        profileImageUrl={resolveImageUrl(borrower.profile_image_url)}
        onLoanCreated={async (totalAmount) => {
          await refreshBorrowerDetails();
          setSuccessToast({
            isOpen: true,
            amount: totalAmount,
            borrowerName: `${borrower.first_name} ${borrower.last_name}`,
            newBalance: totalBalance + totalAmount,
          });
        }}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        isClose={() => setIsPaymentModalOpen(false)}
        borrower={{
          ...borrowerAdapter,
          totalLoan: totalBalance,
          pastPaymentNotes: [],
        }}
        onPaymentCreated={async (amount) => {
          await refreshBorrowerDetails();
          setSuccessToast({
            isOpen: true,
            amount,
            borrowerName: `${borrower.first_name} ${borrower.last_name}`,
            newBalance: totalBalance - amount,
          });
        }}
      />

      <EditLoanModal
        isOpen={isEditLoanOpen}
        isClose={() => setIsEditLoanOpen(false)}
        loan={selectedLoan}
      />

      <AddReminderModal
        isOpen={isReminderModalOpen}
        isClose={() => setIsReminderModalOpen(false)}
        borrowerId={borrower.borrower_id}
        currentBalance={totalBalance}
        contactNumber={borrower.contact_number}
        borrowerEmail={borrower.email}
        borrowerName={`${borrower.first_name} ${borrower.last_name}`}
        storeName={JSON.parse(localStorage.getItem("user") || "{}").store_name}
        onCreateReminder={async (payload) => {
          const res = await createReminder(payload);

          if (res?.ok) {
            await fetchBorrowerReminders(borrower.borrower_id);
          }

          return res;
        }}
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-black text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("details.back")}
        </button>

        {/* Desktop Primary Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            + {t("details.add_loan")}
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
          >
            <span className="text-sm font-black">₱</span>
            + {t("details.add_payment")}
          </button>

          {isOnline && (
            <button
              disabled={balance > 0 || !borrower.is_active}
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: t("details.archive_borrower"),
                  message: t("details.confirm_archive"),
                  onConfirm: async () => {
                    await archiveBorrower(borrower.borrower_id);
                    await fetchBorrowers();
                    navigate("/borrowers");
                  },
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2m-14 0v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {t("details.archive_borrower")}
            </button>
          )}
        </div>
      </div>

      {/* Top Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Total Balance Card */}
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-xl border border-slate-800/80 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            <p className="text-xs font-black text-blue-400 uppercase tracking-wider">{t("details.total_balance")}</p>
            <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
              ₱{totalBalance.toLocaleString()}
            </p>
          </div>

          {/* Quick Payment Buttons */}
          {totalBalance > 0 && (
            <div className="rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <p className="text-xs font-black text-slate-950 tracking-tight uppercase">
                {t("payment.title")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[20, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickPay(amount)}
                    disabled={quickPayLoading !== null || amount > totalBalance}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 px-3 text-xs md:text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    {quickPayLoading === amount ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      `₱${amount}`
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 px-4 text-xs font-black text-slate-700 transition hover:bg-slate-100 cursor-pointer active:scale-[0.98]"
              >
                {t("details.custom_amount")}
              </button>
            </div>
          )}

          {/* Public Link — hidden offline */}
          {isOnline && (
            <div className="border border-slate-200/90 rounded-[2rem] p-6 bg-white shadow-2xs space-y-4">
              <p className="text-xs font-black text-slate-950 tracking-tight uppercase">
                {t("details.public_access")}
              </p>
              <button
                onClick={async () => {
                  await updatePublicLoanAccess(
                    borrower.borrower_id,
                    !borrower.token_enabled
                  );
                }}
                className={`w-full rounded-2xl py-3 text-xs font-black text-white transition cursor-pointer shadow-2xs active:scale-[0.98] ${
                  borrower.token_enabled
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {borrower.token_enabled
                  ? t("details.disable_access")
                  : t("details.enable_access")}
              </button>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">
                  {t("details.status_page_enabled")}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black ${
                    isPublicEnabled
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {isPublicEnabled ? "ON" : "OFF"}
                </span>
              </div>

              <button
                disabled={!publicToken || !isPublicEnabled}
                onClick={() => {
                  navigator.clipboard.writeText(publicStatusLink);
                  setGlobalModal({
                    isOpen: true,
                    title: t("details.copied"),
                    message: t("details.link_copied"),
                    type: "success",
                  });
                }}
                className="w-full rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-white text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t("details.copy_status_link")}
              </button>
            </div>
          )}

          {isOnline && (
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 py-3.5 text-white font-black text-xs transition shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              + {t("details.add_reminder")}
            </button>
          )}
        </div>

        {/* Right Column: Borrower Profile */}
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200/90 bg-white p-6 md:p-8 shadow-2xs">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Borrower profile"
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border-2 border-slate-100 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-3xl border-2 border-slate-100 bg-blue-50 text-2xl sm:text-3xl font-black text-blue-900 shadow-md">
                {borrower.first_name?.[0]}
                {borrower.last_name?.[0]}
              </div>
            )}
          </div>

          {!profileImageUrl && (
            <p className="mt-2 text-[11px] font-bold text-rose-500">
              {t("details.no_profile_uploaded")}
            </p>
          )}

          <h1 className="mt-3 text-center text-xl md:text-2xl font-black text-slate-950 tracking-tight">
            {borrower.first_name} {borrower.middle_name ?? ""}{" "}
            {borrower.last_name}
          </h1>

          <p className="mt-1 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {borrower.contact_number || t("borrowers.no_contact")}
          </p>

          {borrower.email && (
            <p className="text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5 mt-0.5">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {borrower.email}
            </p>
          )}

          <p className="text-center text-xs font-semibold text-slate-400 mt-0.5">
            {t("details.age")} {calculateAge(borrower.dob)}
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-black ${paymentStatusColor}`}
            >
              {paymentStatus}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-black ${activityStatusColor}`}
            >
              {activityStatus}
            </span>
          </div>

          {isOnline && (
            <button
              onClick={() => setIsEditBorrowerOpen(true)}
              className="mt-4 w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-100 cursor-pointer active:scale-[0.98]"
            >
              {t("details.edit_profile")}
            </button>
          )}
        </div>
      </div>

      {/* Filters & Export Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 transition shadow-2xs"
        />

        <input
          placeholder={t("details.filter_product")}
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition shadow-2xs"
        />

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black px-4 py-3 flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t("common.export_csv")}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black px-4 py-3 flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {t("common.export_pdf")}
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3 pb-8">
        {paginatedTransactions.map((txn) => (
          <div
            key={txn.id}
            className={`rounded-3xl border bg-white p-5 shadow-xs space-y-3 transition ${
              txn.voided ? "border-rose-200 bg-rose-50/20 opacity-75" : "border-slate-200/90"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    txn.voided
                      ? "text-slate-400 line-through"
                      : txn.type === "LOAN"
                        ? "text-blue-600"
                        : "text-emerald-600"
                  }`}
                >
                  {txn.type}
                </span>
                {txn.voided && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-rose-600">
                    {t("details.voided")}
                  </span>
                )}
              </div>
              {!txn.voided && isOnline && (
                <button
                  onClick={() => {
                    setVoidReasonInput("");
                    voidReasonRef.current = "";
                    setConfirmModal({
                      isOpen: true,
                      title: t("details.void_transaction"),
                      message: t("details.confirm_void", {
                        type: txn.type,
                        amount: txn.amount.toLocaleString(),
                      }),
                      showReasonInput: true,
                      onConfirm: async () => {
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        await voidTransaction(Number(id), txn.id, voidReasonRef.current || undefined);
                      },
                    });
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                >
                  {t("details.void")}
                </button>
              )}
            </div>

            <span className={`text-[11px] font-bold ${txn.voided ? "text-slate-400" : "text-slate-400"}`}>
              {txn.date}
            </span>

            {txn.voided && txn.voided_at && (
              <p className="text-xs text-rose-400 font-semibold">
                {t("details.voided_on", { date: txn.voided_at.split("T")[0] })}
              </p>
            )}

            {txn.voided && txn.void_reason && (
              <p className="text-xs text-slate-400 font-medium">
                {t("details.void_reason_label")} {txn.void_reason}
              </p>
            )}

            {txn.type === "PAYMENT" && (
              <div className={`mt-2 rounded-2xl border px-4 py-3 ${
                txn.voided
                  ? "border-slate-200 bg-slate-50"
                  : "border-emerald-100 bg-emerald-50/50"
              }`}>
                <p className="text-[11px] font-bold text-slate-400">{t("details.payment_method")}</p>
                <p className={`text-xs font-black ${
                  txn.voided ? "text-slate-400 line-through" : "text-emerald-700"
                }`}>
                  {txn.payment_method || "N/A"}
                </p>
                {txn.payment_note && (
                  <p className={`mt-1 text-xs ${txn.voided ? "text-slate-400" : "text-slate-600"}`}>
                    {txn.payment_note}
                  </p>
                )}
              </div>
            )}

            {txn.type === "LOAN" && txn.items && (
              <div className={`text-xs space-y-1.5 ${txn.voided ? "text-slate-400" : "text-slate-700"}`}>
                {txn.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between font-bold">
                    <span className={txn.voided ? "line-through text-slate-400" : "text-slate-900"}>
                      {item.quantity} × {item.product}
                    </span>
                    <span className={txn.voided ? "line-through text-slate-400" : "text-blue-900"}>
                      ₱{(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className={`flex justify-between items-center rounded-2xl px-4 py-2.5 text-xs font-bold ${
              txn.voided ? "bg-rose-50/80" : "bg-slate-50"
            }`}>
              <span className={txn.voided ? "text-rose-500" : "text-slate-500"}>{t("details.running_balance")}</span>
              <span className={`font-black ${txn.voided ? "text-rose-500" : "text-slate-950"}`}>
                {txn.voided
                  ? `(${t("details.excluded")})`
                  : `₱${Number(txn.runningBalance || 0).toLocaleString()}`
                }
              </span>
            </div>

            <div className="flex justify-end">
              <span
                className={`text-base font-black ${
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
        ))}
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

      {/* Collection Reminders */}
      <div className="border-t border-slate-200/80 pt-6 space-y-4">
        <h2 className="text-base font-black text-slate-950 tracking-tight">
          {t("details.collection_reminders")}
        </h2>

        {(borrowerReminders || []).length === 0 && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs font-semibold text-slate-500 text-center">
            {t("details.no_reminders_yet")}
          </div>
        )}

        <div className="space-y-3">
          {(borrowerReminders || []).map((reminder: any) => (
            <div
              key={reminder.reminder_id}
              className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs"
            >
              <div className="flex justify-between items-center">
                <p className="font-black text-slate-950 text-sm">
                  ₱{Number(reminder.amount_expected || 0).toLocaleString()}
                </p>

                <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-black text-amber-700">
                  {reminder.status}
                </span>
              </div>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {t("details.due")} {new Date(reminder.due_date).toLocaleDateString()}
              </p>

              {reminder.note && (
                <p className="mt-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {reminder.note}
                </p>
              )}

              {borrower.contact_number && isOnline && (
                <div className="mt-3 flex gap-2">
                  {canSendSMS() ? (
                    <button
                      onClick={() => {
                        const msg = buildReminderSMS({
                          firstName: borrower.first_name,
                          storeName: JSON.parse(localStorage.getItem("user") || "{}").store_name || "Store",
                          amount: reminder.amount_expected || 0,
                          dueDate: new Date(reminder.due_date).toLocaleDateString(),
                        });
                        sendNativeSMS(borrower.contact_number, msg);
                      }}
                      className="rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-1.5 text-xs font-black text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      {t("sms.send")}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                      {t("sms.mobile_only")}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="border-t border-slate-200/80 pt-6 space-y-4">
        <h2 className="text-base font-black text-slate-950 tracking-tight">{t("details.notes")}</h2>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {(borrowerNotes || []).length === 0 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs font-semibold text-slate-500 text-center">
              {t("details.no_notes")}
            </div>
          )}

          {(borrowerNotes || []).map((note: any) => (
            <div
              key={note.borrower_note_id}
              className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-800 space-y-2"
            >
              <div className="text-[11px] font-bold text-slate-400">
                {new Date(note.created_at).toLocaleDateString()}
              </div>

              {editingNoteId === note.borrower_note_id ? (
                <textarea
                  value={editingNoteText}
                  onChange={(e) => setEditingNoteText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 resize-none"
                />
              ) : (
                <p className="leading-relaxed">{note.note_text}</p>
              )}

              {isOnline && (
                <div className="flex gap-2">
                  {editingNoteId === note.borrower_note_id ? (
                    <>
                      <button
                        onClick={handleUpdateNote}
                        className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-black text-white cursor-pointer"
                      >
                        {t("details.save")}
                      </button>

                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditingNoteText("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        {t("details.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingNoteId(note.borrower_note_id);
                          setEditingNoteText(note.note_text);
                        }}
                        className="rounded-xl px-2.5 py-1 text-[11px] font-black text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        {t("details.edit")}
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.borrower_note_id)}
                        className="rounded-xl px-2.5 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        {t("details.delete")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {isOnline && (
          <div className="flex gap-2">
            <input
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={t("details.add_note_placeholder")}
              className="flex-1 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition shadow-2xs"
            />

            <button
              onClick={handleAddNote}
              className="rounded-2xl bg-slate-950 hover:bg-slate-900 px-6 py-3 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer"
            >
              {t("details.send")}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Footer Actions (ONLY visible on mobile `md:hidden`) */}
      <div className="fixed bottom-0 left-0 z-30 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md md:hidden shadow-lg">
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-2 p-3">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-950 py-2.5 text-slate-950 active:scale-95 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-1 text-[11px] font-black">
              {t("details.add_loan")}
            </span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-2xl bg-emerald-600 py-2.5 text-white active:scale-95 transition"
          >
            <span className="text-sm font-black">₱</span>
            <span className="mt-1 text-[11px] font-black">
              {t("details.add_payment")}
            </span>
          </button>

          {isOnline && (
            <button
              disabled={balance > 0 || !borrower.is_active}
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: t("details.archive_borrower"),
                  message: t("details.confirm_archive"),
                  onConfirm: async () => {
                    await archiveBorrower(borrower.borrower_id);
                    await fetchBorrowers();
                    navigate("/borrowers");
                  },
                });
              }}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-700 py-2.5 text-white disabled:opacity-50 active:scale-95 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2m-14 0v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="mt-1 text-[11px] font-black">
                Archive
              </span>
            </button>
          )}
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => {
          setGlobalModal({ ...globalModal, isOpen: false });
          clearBorrowerError();
          clearReminderError();
        }}
      />

      <SuccessToast
        isOpen={successToast.isOpen}
        amount={successToast.amount}
        borrowerName={successToast.borrowerName}
        newBalance={successToast.newBalance}
        onClose={() => setSuccessToast(prev => ({ ...prev, isOpen: false }))}
      />

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden text-center animate-modal-pop">
            <h2 className="text-base font-black text-slate-950 tracking-tight">{confirmModal.title}</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">{confirmModal.message}</p>
            {confirmModal.showReasonInput && (
              <textarea
                value={voidReasonInput}
                onChange={(e) => { setVoidReasonInput(e.target.value); voidReasonRef.current = e.target.value; }}
                placeholder={t("details.void_reason_placeholder")}
                className="mt-3 w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 resize-none transition"
                rows={2}
              />
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.cancel")}
              </button>
              <button
                onClick={confirmModal.onConfirm}
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