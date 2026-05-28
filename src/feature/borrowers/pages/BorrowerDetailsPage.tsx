import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";

import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";

import AddPaymentModal from "../modals/AddPaymentModal";
import AddLoanModalBorrowerDetails from "../modals/AddLoanModalBorrowerDetails";
import EditLoanModal from "../modals/EditLoanModal";
import AddReminderModal from "../modals/AddReminderModal";

import { useCollectionReminder } from "../../context/collection-reminders/useCollectionReminder";
import { usePayment } from "../../context/payments/usePayment";
import GlobalModal from "../../../shared/components/GlobalModal";
import SuccessToast from "../../../shared/components/SuccessToast";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
}>({ isOpen: false, title: "", message: "", onConfirm: () => {} });


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
    uploadBorrowerProfileImage,
    uploadingProfileImage,
    loading,
    updatePublicLoanAccess ,
    archiveBorrower,
borrowerNotes,
fetchBorrowerNotes,
createBorrowerNote,
updateBorrowerNote,
deleteBorrowerNote,
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

      const res = await createPayment({
        borrower_id: Number(id),
        amount,
        payment_type: "CASH",
        note: "",
      });

      if (res?.ok) {
        await refreshBorrowerDetails();
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
    return transactions.reduce((acc, txn) => {
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
    runningBalance =
      t.type === "LOAN"
        ? runningBalance + Number(t.amount)
        : runningBalance - Number(t.amount);

    withBalance[i] = { ...t, runningBalance };
  }

  return withBalance;
}, [filteredTransactions]);

useEffect(() => {
  if (!id) return;

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

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !id) return;

    await uploadBorrowerProfileImage(id, file);

    e.target.value = "";
  };

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

  const handleExport = () => {
    console.log("Export to Excel");
  };

  const refreshBorrowerDetails = async () => {
  if (!id) return;

  await fetchBorrowerTransactions(id);
  await fetchBorrowers();
  await fetchBorrowerReminders(id);
};

  return (
    <div className="space-y-6 pb-32">
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
  onCreateReminder={async (payload) => {
    const res = await createReminder(payload);

    if (res?.ok) {
      await fetchBorrowerReminders(borrower.borrower_id);
    }

    return res;
  }}
/>

      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#1E3A8A] font-medium"
        >
          ← {t("details.back")}
        </button>
      </div>

      {/* Top Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Balance */}
          <div className="rounded-xl bg-[#1E3A8A] text-white p-5">
            <p className="text-sm text-blue-100">{t("details.total_balance")}</p>
            <p className="text-3xl font-bold mt-2">
              ₱{totalBalance.toLocaleString()}
            </p>
          </div>

          {/* Quick Payment Buttons */}
          {totalBalance > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#1E3A8A] mb-3">
                {t("payment.title")}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[20, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickPay(amount)}
                    disabled={quickPayLoading !== null || amount > totalBalance}
                    className="rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="mt-3 w-full rounded-xl border border-[#1E3A8A] py-2.5 text-sm font-medium text-[#1E3A8A] transition hover:bg-blue-50"
              >
                {t("details.custom_amount")}
              </button>
            </div>
          )}

{/* Public Link */}
<div className="border rounded-xl p-4 bg-gray-50 space-y-3">
  <p className="text-sm font-semibold text-[#1E3A8A]">
    {t("details.public_access")}
  </p>
  <button
  onClick={async () => {
    await updatePublicLoanAccess(
      borrower.borrower_id,
      !borrower.token_enabled
    );
  }}
  className={`w-full rounded-lg py-3 text-sm font-medium text-white ${
    borrower.token_enabled
      ? "bg-red-500"
      : "bg-green-600"
  }`}
>
  {borrower.token_enabled
    ? t("details.disable_access")
    : t("details.enable_access")}
</button>

  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">
      {t("details.status_page_enabled")}
    </span>

    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        isPublicEnabled
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
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
    className="w-full rounded-lg bg-[#1E3A8A] py-3 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  >
    📩 {t("details.copy_status_link")}
  </button>
</div>

          <button
  onClick={() => setIsReminderModalOpen(true)}
  className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold"
>
  + {t("details.add_reminder")}
</button>

        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingProfileImage}
className="relative h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full"          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Borrower profile"
className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full border-4 border-[#1E3A8A] object-cover shadow-xl"              />
            ) : (
              <div className="flex h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 items-center justify-center rounded-full border-4 border-[#1E3A8A] bg-blue-50 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E3A8A] shadow-xl">
                {borrower.first_name?.[0]}
                {borrower.last_name?.[0]}
              </div>
            )}

            <span className="absolute bottom-4 right-3 rounded-full bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white shadow-lg">
              {uploadingProfileImage ? "..." : t("details.edit")}
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleProfileImageChange}
            className="hidden"
          />

          {!profileImageUrl && (
            <p className="mt-2 text-xs font-medium text-red-600">
              {t("details.no_profile_uploaded")}
            </p>
          )}

          <h1 className="mt-4 text-center text-2xl font-semibold text-[#1E3A8A]">
            {borrower.first_name} {borrower.middle_name ?? ""}{" "}
            {borrower.last_name}
          </h1>

          <p className="mt-1 text-center text-sm text-gray-500">
            📞 {borrower.contact_number}
          </p>

          <p className="text-center text-sm text-gray-500">
            {t("details.age")} {calculateAge(borrower.dob)}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusColor}`}
  >
    {paymentStatus}
  </span>

  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${activityStatusColor}`}
  >
    {activityStatus}
  </span>
</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-3 text-sm"
        />

        <input
          placeholder={t("details.filter_product")}
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm"
        />

        <button
          onClick={handleExport}
          className="rounded-lg bg-[#1E3A8A] px-4 py-3 text-sm font-medium text-white"
        >
          {t("details.export")}
        </button>
      </div>

      {/* Transactions */}
<div className="space-y-4 pb-24">
        {paginatedTransactions.map((txn) => (
          <div
            key={txn.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-semibold ${
                  txn.type === "LOAN" ? "text-[#1E3A8A]" : "text-[#16A34A]"
                }`}
              >
                {txn.type}
              </span>
            </div>

            <span className="text-xs text-gray-500">{txn.date}</span>
            {txn.type === "PAYMENT" && (
  <div className="mt-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2">
    <p className="text-xs text-gray-500">{t("details.payment_method")}</p>

    <p className="text-sm font-semibold text-[#16A34A]">
      {txn.payment_method || "N/A"}
    </p>

    {txn.payment_note && (
      <p className="mt-1 text-xs text-gray-600">
        {txn.payment_note}
      </p>
    )}
  </div>
)}

            {txn.type === "LOAN" && txn.items && (
              <div className="text-sm text-gray-600 space-y-1">
                {txn.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-blue-700 text-sm">
                      {item.quantity} × {item.product}
                    </span>
                    <span className="text-blue-500 text-sm">
                      ₱{(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
  <span className="text-gray-500">{t("details.running_balance")}</span>
  <span className="font-semibold text-[#1E3A8A]">
    ₱{Number(txn.runningBalance || 0).toLocaleString()}
  </span>
</div>

            <div className="flex justify-end">
              <span
                className={`text-base font-bold ${
                  txn.type === "LOAN" ? "text-[#1E3A8A]" : "text-[#16A34A]"
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
        <div className="flex justify-center gap-2 pt-4">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-2 rounded-lg text-sm ${
                currentPage === index + 1
                  ? "bg-[#1E3A8A] text-white"
                  : "border border-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Collection Reminders */}
<div className="border-t pt-6 space-y-4">
  <h2 className="text-lg font-semibold text-[#1E3A8A]">
    {t("details.collection_reminders")}
  </h2>

  {(borrowerReminders || []).length === 0 && (
    <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-500">
      {t("details.no_reminders_yet")}
    </div>
  )}

  <div className="space-y-3">
    {(borrowerReminders || []).map((reminder: any) => (
      <div
        key={reminder.reminder_id}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex justify-between">
          <p className="font-semibold text-[#1E3A8A]">
            ₱{Number(reminder.amount_expected || 0).toLocaleString()}
          </p>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            {reminder.status}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {t("details.due")} {new Date(reminder.due_date).toLocaleDateString()}
        </p>

        {reminder.note && (
          <p className="mt-2 text-sm text-gray-700">
            {reminder.note}
          </p>
        )}
      </div>
    ))}
  </div>
</div>

{/* Notes */}
<div className="border-t pt-6 space-y-4">
  <h2 className="text-lg font-semibold text-[#1E3A8A]">{t("details.notes")}</h2>

  <div className="space-y-2 max-h-60 overflow-y-auto">
    {(borrowerNotes || []).length === 0 && (
      <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-500">
        {t("details.no_notes")}
      </div>
    )}

    {(borrowerNotes || []).map((note: any) => (
      <div
        key={note.borrower_note_id}
        className="bg-gray-100 rounded-lg p-3 text-sm space-y-2"
      >
        <div className="text-xs text-gray-500">
          {new Date(note.created_at).toLocaleDateString()}
        </div>

        {editingNoteId === note.borrower_note_id ? (
          <textarea
            value={editingNoteText}
            onChange={(e) => setEditingNoteText(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
          />
        ) : (
          <p>{note.note_text}</p>
        )}

        <div className="flex gap-2">
          {editingNoteId === note.borrower_note_id ? (
            <>
              <button
                onClick={handleUpdateNote}
                className="rounded-lg bg-[#1E3A8A] px-3 py-2 text-xs text-white"
              >
                {t("details.save")}
              </button>

              <button
                onClick={() => {
                  setEditingNoteId(null);
                  setEditingNoteText("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700"
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
                className="text-xs text-[#1E3A8A] underline"
              >
                {t("details.edit")}
              </button>

              <button
                onClick={() => handleDeleteNote(note.borrower_note_id)}
                className="text-xs text-red-500 underline"
              >
                {t("details.delete")}
              </button>
            </>
          )}
        </div>
      </div>
    ))}
  </div>

  <div className="flex flex-wrap justify-center gap-2">
    <input
      value={noteInput}
      onChange={(e) => setNoteInput(e.target.value)}
      placeholder={t("details.add_note_placeholder")}
      className="flex-1 rounded-lg border border-gray-300 px-5 py-5 text-sm"
    />

    <button
      onClick={handleAddNote}
      className="rounded-lg bg-[#1E3A8A] p-4 text-white text-sm w-full"
    >
      {t("details.send")}
    </button>
  </div>
  {/* Desktop Actions */}
<div className="hidden lg:flex gap-2 justify-center">
  <button
    onClick={() => setIsLoanModalOpen(true)}
    className="w-1/3 rounded-xl border border-[#1E3A8A] py-3 font-semibold text-[#1E3A8A]"
  >
    + {t("details.add_loan")}
  </button>

  <button
    onClick={() => setIsPaymentModalOpen(true)}
    className="w-1/3 rounded-xl bg-[#16A34A] py-3 font-semibold text-white"
  >
    + {t("details.add_payment")}
  </button>

  <button
    disabled={balance > 0 || !borrower.is_active}
    onClick={async () => {
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
    className="w-1/3 rounded-xl bg-gray-700 py-3 font-semibold text-white disabled:opacity-50"
  >
    {t("details.archive_borrower")}
  </button>
</div>

{/* Mobile Bottom Footer Actions */}
<div className="
  fixed bottom-0 left-0 z-30 w-full
  border-t border-gray-200 bg-white/95 backdrop-blur
">
  <div className="mx-auto grid max-w-2xl grid-cols-3 gap-2 p-3">

    {/* Loan */}
    <button
      onClick={() => setIsLoanModalOpen(true)}
      className="flex flex-col items-center justify-center rounded-xl border border-[#1E3A8A] py-2 text-[#1E3A8A]"
    >
      <span className="text-lg">🧾</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("details.add_loan")}
      </span>
    </button>

    {/* Payment */}
    <button
      onClick={() => setIsPaymentModalOpen(true)}
      className="flex flex-col items-center justify-center rounded-xl bg-[#16A34A] py-2 text-white"
    >
      <span className="text-lg">₱</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("details.add_payment")}
      </span>
    </button>

    {/* Archive */}
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
      className="flex flex-col items-center justify-center rounded-xl bg-gray-700 py-2 text-white disabled:opacity-50"
    >
      <span className="text-lg">📦</span>

      <span className="mt-1 text-[11px] font-medium">
        Archive
      </span>
    </button>
  </div>

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
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
    <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <h2 className="text-lg font-semibold text-[#1E3A8A]">{confirmModal.title}</h2>
      <p className="mt-3 text-sm text-gray-600">{confirmModal.message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
        >
          {t("details.cancel")}
        </button>
        <button
          onClick={confirmModal.onConfirm}
          className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white"
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