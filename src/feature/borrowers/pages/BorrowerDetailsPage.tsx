import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

import { useBorrower } from "../../context/borrowers/useBorrower";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";
import { calculateAge } from "../../components/utility/calculateAge";

import AddPaymentModal from "../modals/AddPaymentModal";
import AddLoanModalBorrowerDetails from "../modals/AddLoanModalBorrowerDetails";
import EditLoanModal from "../modals/EditLoanModal";
import AddReminderModal from "../modals/AddReminderModal";
import EditBorrowerModal from "../modals/EditBorrowerModal";

import BorrowerProfileHeader from "../components/BorrowerProfileHeader";
import BorrowerBalanceOverview from "../components/BorrowerBalanceOverview";
import BorrowerTransactionLedger from "../components/BorrowerTransactionLedger";
import BorrowerRemindersCard from "../components/BorrowerRemindersCard";
import BorrowerNotesCard from "../components/BorrowerNotesCard";

import { useCollectionReminder } from "../../context/collection-reminders/useCollectionReminder";
import GlobalModal from "../../../shared/components/GlobalModal";
import SuccessToast from "../../../shared/components/SuccessToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";

export default function BorrowerDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  // Modals state
  const [isEditBorrowerOpen, setIsEditBorrowerOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<{
    id: number;
    borrowerId: number;
    items: any[];
  } | null>(null);

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

  const [successToast, setSuccessToast] = useState<{
    isOpen: boolean;
    amount: number;
    borrowerName: string;
    newBalance: number;
  }>({ isOpen: false, amount: 0, borrowerName: "", newBalance: 0 });

  // Context Hooks
  const {
    borrowers,
    transactions,
    fetchBorrowers,
    fetchBorrowerTransactions,
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
  }, [borrowerError, reminderError, t]);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const borrower = useMemo(() => {
    if (!borrowers) return null;
    return borrowers.find((b: any) => String(b.borrower_id) === String(id));
  }, [borrowers, id]);

  useEffect(() => {
    if (!id) return;
    if (borrower?._pending) return;

    clearBorrowerError();
    clearReminderError();
    fetchBorrowerTransactions(id);
    fetchBorrowerNotes(id);
    fetchBorrowerReminders(id);
  }, [id, borrower?._pending]);

  const totalBalance = useMemo(() => {
    return transactions
      .filter((txn) => !txn.voided)
      .reduce((acc, txn) => {
        return txn.type === "LOAN" ? acc + txn.amount : acc - txn.amount;
      }, 0);
  }, [transactions]);

  const refreshBorrowerDetails = async () => {
    if (!id) return;

    try {
      await fetchBorrowerTransactions(id);
      await fetchBorrowerNotes(id);
      await fetchBorrowerReminders(id);
    } catch (e) {
      console.warn("[BorrowerDetails] Refresh failed:", e);
    }
    await fetchBorrowers();
  };

  if (!borrower) {
    return <div className="p-6 text-gray-500">{t("details.loading")}</div>;
  }

  const isPending = borrower._pending || Number(borrower.borrower_id) > 2147483647;
  const balance = Number(totalBalance || 0);

  const borrowerAdapter = {
    id: borrower.borrower_id,
    fName: borrower.first_name,
    lName: borrower.last_name,
    age: calculateAge(borrower.dob),
    contact: borrower.contact_number,
    profileImageUrl: resolveImageUrl(borrower.profile_image_url),
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Offline and Pending Status Banners */}
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

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-black text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("details.back")}
        </button>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black shadow-md shadow-slate-950/20 transition active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t("details.add_loan")}</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span className="text-sm font-black">₱</span>
            <span>{t("details.add_payment")}</span>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Archive Borrower"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2m-14 0v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="hidden sm:inline">{t("details.archive_borrower")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Layout Grid: Left (Balance & Quick Pay) + Right (Borrower Profile) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <BorrowerBalanceOverview
          borrower={borrower}
          totalBalance={totalBalance}
          isOnline={isOnline}
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
          onOpenReminderModal={() => setIsReminderModalOpen(true)}
          onPaymentSuccess={async (amount, newBal) => {
            try {
              await refreshBorrowerDetails();
            } catch (e) {
              console.warn("[QuickPay] Refresh failed:", e);
            }
            setSuccessToast({
              isOpen: true,
              amount,
              borrowerName: `${borrower.first_name} ${borrower.last_name}`,
              newBalance: newBal,
            });
          }}
          onSuccessMessage={(title, message) => {
            setGlobalModal({ isOpen: true, title, message, type: "success" });
          }}
        />

        <BorrowerProfileHeader
          borrower={borrower}
          totalBalance={totalBalance}
          isOnline={isOnline}
          onEditProfile={() => setIsEditBorrowerOpen(true)}
        />
      </div>

      {/* Transactions Ledger (Filters, Export, Pagination, Void Flow) */}
      <BorrowerTransactionLedger
        borrower={borrower}
        transactions={transactions}
        totalBalance={totalBalance}
        isOnline={isOnline}
        onVoidTransaction={async (borrowerId, txnId, reason) => {
          await voidTransaction(borrowerId, txnId, reason);
          await refreshBorrowerDetails();
        }}
      />

      {/* Collection Reminders */}
      <BorrowerRemindersCard
        reminders={borrowerReminders}
        borrower={borrower}
        isOnline={isOnline}
      />

      {/* Merchant Notes Section */}
      <BorrowerNotesCard
        notes={borrowerNotes}
        isOnline={isOnline}
        onCreateNote={async (text) => {
          const res = await createBorrowerNote(id!, text);
          return !!res?.ok;
        }}
        onUpdateNote={async (noteId, text) => {
          const res = await updateBorrowerNote(id!, noteId, text);
          return !!res?.ok;
        }}
        onDeleteNote={async (noteId) => {
          await deleteBorrowerNote(id!, noteId);
        }}
      />

      {/* Mobile Bottom Footer Actions (Visible on mobile only) */}
      <div className="fixed bottom-0 left-0 z-30 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md md:hidden shadow-lg">
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-2 p-3">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-950 py-2.5 text-slate-950 active:scale-95 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-1 text-[11px] font-black">{t("details.add_loan")}</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-2xl bg-emerald-600 py-2.5 text-white active:scale-95 transition"
          >
            <span className="text-sm font-black">₱</span>
            <span className="mt-1 text-[11px] font-black">{t("details.add_payment")}</span>
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
              <span className="mt-1 text-[11px] font-black">Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals & Dialogs */}
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
            amount: totalAmount || 0,
            borrowerName: `${borrower.first_name} ${borrower.last_name}`,
            newBalance: totalBalance + (totalAmount || 0),
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
        onClose={() => setSuccessToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden text-center animate-modal-pop">
            <h2 className="text-base font-black text-slate-950 tracking-tight">{confirmModal.title}</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">{confirmModal.message}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
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