import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";

import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";

import AddPaymentModal from "../modals/AddPaymentModal";
import AddLoanModalBorrowerDetails from "../modals/AddLoanModalBorrowerDetails";
import EditLoanModal from "../modals/EditLoanModal";

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

interface Note {
  id: number;
  message: string;
  date: string;
}

const ITEMS_PER_PAGE = 3;

export default function BorrowerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const [dateFilter, setDateFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [noteInput, setNoteInput] = useState("");

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
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
  } = useBorrower();

  useEffect(() => {
    if (location.state?.openPayment) {
      setIsPaymentModalOpen(true);
    }
  }, [location.state]);

  const [notes, setNotes] = useState<Note[]>([
    { id: 1, message: "Customer promised to pay Friday.", date: "2025-01-03" },
  ]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === "LOAN" ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchDate = dateFilter ? t.date === dateFilter : true;

      const matchProduct =
        t.type === "LOAN" && productFilter
          ? t.items?.some((i) =>
              i.product.toLowerCase().includes(productFilter.toLowerCase())
            )
          : true;

      return matchDate && matchProduct;
    });
  }, [transactions, dateFilter, productFilter]);

  useEffect(() => {
    if (!id) return;

    fetchBorrowerTransactions(id);
  }, []);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const borrower = useMemo(() => {
    if (!borrowers) return null;

    const sorted = [...borrowers].sort(
      (a: any, b: any) => a.borrower_id - b.borrower_id
    );

    return sorted.find((b: any) => String(b.borrower_id) === String(id));
  }, [borrowers, id]);

  if (loading || !borrower) {
    return <div className="p-6 text-gray-500">Loading borrower details...</div>;
  }

  const borrowerAdapter = {
    id: borrower.borrower_id,
    fName: borrower.first_name,
    lName: borrower.last_name,
    age: calculateAge(borrower.dob),
    contact: borrower.contact_number,
  };

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const profileImageUrl = borrower.profile_image_url || null;

  const balance = Number(borrower.balance || 0);

const paymentStatus =
  balance <= 0 ? "Fully Paid" : "With Balance";

const paymentStatusColor =
  balance <= 0
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

const activityStatus =
  borrower.is_active
    ? "Active"
    : "Archived";

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

  const handleAddNote = () => {
    if (!noteInput.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      message: noteInput,
      date: new Date().toISOString().split("T")[0],
    };

    setNotes([...notes, newNote]);
    setNoteInput("");
  };

  const handleExport = () => {
    console.log("Export to Excel");
  };

  return (
    <div className="space-y-6 pb-32">
<AddLoanModalBorrowerDetails
  isOpen={isLoanModalOpen}
  isClose={() => setIsLoanModalOpen(false)}
  borrowerId={borrower.borrower_id}
  onLoanCreated={() => {
    fetchBorrowerTransactions(borrower.borrower_id);
    fetchBorrowers();
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
      />

      <EditLoanModal
        isOpen={isEditLoanOpen}
        isClose={() => setIsEditLoanOpen(false)}
        loan={selectedLoan}
      />

      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#1E3A8A] font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Top Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Balance */}
          <div className="rounded-xl bg-[#1E3A8A] text-white p-5">
            <p className="text-sm text-blue-100">Total Balance</p>
            <p className="text-3xl font-bold mt-2">
              ₱{totalBalance.toLocaleString()}
            </p>
          </div>

{/* Public Link */}
<div className="border rounded-xl p-4 bg-gray-50 space-y-3">
  <p className="text-sm font-semibold text-[#1E3A8A]">
    Public Loan Status Access
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
    ? "Disable Public Access"
    : "Enable Public Access"}
</button>

  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">
      Status Page Enabled
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
      alert("Loan status link copied");
    }}
    className="w-full rounded-lg bg-[#1E3A8A] py-3 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  >
    📩 Copy Loan Status Link
  </button>
</div>
          {/* Actions */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="w-1/3 rounded-xl border border-[#1E3A8A] py-3 text-[#1E3A8A] font-semibold"
            >
              + Add Loan
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-1/3 rounded-xl bg-[#16A34A] py-3 text-white font-semibold"
            >
              + Add Payment
            </button>
            <button
  disabled={balance > 0 || !borrower.is_active}
  onClick={async () => {
    const confirmed = window.confirm(
      "Archive this borrower?"
    );

    if (!confirmed) return;

    await archiveBorrower(borrower.borrower_id);

    await fetchBorrowers();

    navigate("/borrowers");
  }}
  className="w-1/3 rounded-xl bg-gray-700 py-3 text-white font-semibold disabled:opacity-50"
>
  Archive Borrower
</button>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingProfileImage}
className="relative h-56 w-56 lg:h-64 lg:w-64 rounded-full"          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Borrower profile"
className="h-56 w-56 lg:h-64 lg:w-64 rounded-full border-4 border-[#1E3A8A] object-cover shadow-xl"              />
            ) : (
              <div className="flex h-56 w-56 lg:h-64 lg:w-64 items-center justify-center rounded-full border-4 border-red-600 bg-red-100 text-6xl font-bold text-red-700 shadow-xl">
                {borrower.first_name?.[0]}
                {borrower.last_name?.[0]}
              </div>
            )}

            <span className="absolute bottom-4 right-3 rounded-full bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white shadow-lg">
              {uploadingProfileImage ? "..." : "Edit"}
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
              No profile image uploaded
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
            Age {calculateAge(borrower.dob)}
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
          placeholder="Filter by product..."
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm"
        />

        <button
          onClick={handleExport}
          className="rounded-lg bg-[#1E3A8A] px-4 py-3 text-sm font-medium text-white"
        >
          Export
        </button>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        {paginatedTransactions.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2"
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-semibold ${
                  t.type === "LOAN" ? "text-[#1E3A8A]" : "text-[#16A34A]"
                }`}
              >
                {t.type}
              </span>

              {t.type === "LOAN" && (
                <button
                  onClick={() => {
                    setSelectedLoan({
                      id: t.id,
                      borrowerId: borrower.borrower_id,
                      items: t.items || [],
                    });
                    setIsEditLoanOpen(true);
                  }}
                  className="text-xs text-gray-500 underline"
                >
                  Edit
                </button>
              )}
            </div>

            <span className="text-xs text-gray-400">{t.date}</span>

            {t.type === "LOAN" && t.items && (
              <div className="text-sm text-gray-600 space-y-1">
                {t.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-blue-700 text-[20px]">
                      {item.quantity} × {item.product}
                    </span>
                    <span className="text-blue-500 text-[20px]">
                      ₱{(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <span
                className={`text-base font-bold ${
                  t.type === "LOAN" ? "text-[#1E3A8A]" : "text-[#16A34A]"
                }`}
              >
                {t.type === "LOAN" ? "+" : "-"}₱{t.amount.toLocaleString()}
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

      {/* Notes */}
      <div className="border-t pt-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">Notes</h2>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-100 rounded-lg p-3 text-sm">
              <div className="text-xs text-gray-500 mb-1">{note.date}</div>
              {note.message}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border border-gray-300 px-5 py-5 text-sm"
          />

          <button
            onClick={handleAddNote}
            className="rounded-lg bg-[#1E3A8A] px-4 text-white p-4 text-sm w-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}