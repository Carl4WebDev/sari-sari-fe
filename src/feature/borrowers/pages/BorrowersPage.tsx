import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";

import ArchivedBorrowersModal from "../modals/ArchivedBorrowersModal";

import GlobalModal from "../../../shared/components/GlobalModal";
import AddBorrowerModal from "../../dashboard/modals/AddBorrowerModal";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { generateBorrowersPDF } from "../../../shared/utils/exportToPDF";

export default function BorrowersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
const [isAddBorrowerOpen, setIsAddBorrowerOpen] = useState(false);

const {
  borrowers,
  archivedBorrowers,
  fetchBorrowers,
  fetchArchivedBorrowers,
  reactivateBorrower,
  loading,
  error: borrowerError,
  clearError: clearBorrowerError,
} = useBorrower();

  const [currentPage, setCurrentPage] = useState(1);
const [isArchivedOpen, setIsArchivedOpen] = useState(false);
const [isSearchFocused, setIsSearchFocused] = useState(false);

const [globalModal, setGlobalModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
});

  const itemsPerPage = 5;

  useEffect(() => {
    clearBorrowerError();
    fetchBorrowers();
  }, []);

  useEffect(() => {
    if (borrowerError) {
      setGlobalModal({ isOpen: true, title: "Error", message: borrowerError, type: "error" });
    }
  }, [borrowerError]);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b: any) =>
      `${b.first_name} ${b.middle_name ?? ""} ${b.last_name} ${b.contact_number}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [borrowers, search]);

  const totalPages = Math.ceil(filteredBorrowers.length / itemsPerPage);

  const paginatedBorrowers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBorrowers.slice(start, start + itemsPerPage);
  }, [filteredBorrowers, currentPage]);

const handleExportCSV = () => {
  if (!filteredBorrowers.length) {
    setGlobalModal({
      isOpen: true,
      title: t("borrowers.copied"),
      message: t("borrowers.no_export"),
      type: "success",
    });
    return;
  }

  const headers = [
    "Borrower ID",
    "First Name",
    "Middle Name",
    "Last Name",
    "Contact Number",
    "Date of Birth",
    "Age",
    "Balance",
    "Status",
  ];

  const rows = filteredBorrowers.map((b: any) => [
    b.borrower_id,
    b.first_name ?? "",
    b.middle_name ?? "",
    b.last_name ?? "",
    b.contact_number ?? "",
    b.dob ?? "",
    calculateAge(b.dob),
    Number(b.balance || 0),
    Number(b.balance || 0) <= 0 ? t("borrowers.fully_paid") : t("borrowers.with_balance"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `borrowers-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};

const handleExportPDF = () => {
  if (!filteredBorrowers.length) {
    setGlobalModal({
      isOpen: true,
      title: t("borrowers.copied"),
      message: t("borrowers.no_export"),
      type: "success",
    });
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  generateBorrowersPDF(filteredBorrowers, user.store_name || "");
};

const handleBorrowerCreated = async (borrower: any) => {
  await fetchBorrowers();

  setSearch("");
  setCurrentPage(1);

  if (borrower?.borrower_id) {
    navigate(`/borrowers/${borrower.borrower_id}`);
  }
};

  return (
    
    <div className="min-h-screen pb-24 space-y-5">
<ArchivedBorrowersModal
  isOpen={isArchivedOpen}
  isClose={() => setIsArchivedOpen(false)}
  archivedBorrowers={archivedBorrowers}
  loading={loading}
  onFetchArchived={fetchArchivedBorrowers}
  onReactivate={reactivateBorrower}
/>

<AddBorrowerModal
  isOpen={isAddBorrowerOpen}
  isClose={() => setIsAddBorrowerOpen(false)}
  onBorrowerCreated={handleBorrowerCreated}
/>
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-bold">{t("borrowers.title")}</h1>
        <p className="mt-1 text-sm text-blue-100">
          {t("borrowers.subtitle")}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs text-blue-100">{t("borrowers.total_borrowers")}</p>
            <p className="text-xl font-bold">{borrowers.length}</p>
          </div>

          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs text-blue-100">{t("borrowers.showing")}</p>
            <p className="text-xl font-bold">{filteredBorrowers.length}</p>
          </div>
        </div>
      </div>

{/* Sticky Search */}
<div className="sticky top-0 z-30 px-1 py-2 backdrop-blur-sm">
  <div className="rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-lg">
    
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        🔍
      </span>

      <input
        placeholder={t("borrowers.search")}
        value={search}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="
          w-full rounded-xl border border-gray-200
          py-2.5 pl-9 pr-3 text-sm outline-none
          transition-all duration-300
          focus:border-[#1E3A8A]
          focus:ring-2 focus:ring-blue-100
          bg-white
        "
      />
    </div>
  </div>
</div>
      {/* Borrower List */}
      <div className="space-y-3">
        {loading && (
          <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
            Loading borrowers...
          </div>
        )}

        {!loading &&
          paginatedBorrowers.map((b: any) => (
            <Link
              key={b.borrower_id}
              to={`/borrowers/${b.borrower_id}`}
              className="block"
            >
<article className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-[#1E3A8A] hover:shadow-md">
  <div className="flex items-center gap-3">
    
    {/* Profile */}
    {b.profile_image_url ? (
      <img
        src={resolveImageUrl(b.profile_image_url)}
        alt={`${b.first_name} ${b.last_name}`}
        className="h-14 w-14 shrink-0 rounded-full border-2 border-[#1E3A8A] object-cover"
      />
    ) : (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#1E3A8A] bg-blue-50 text-sm font-bold text-[#1E3A8A]">
        {b.first_name?.[0]}
        {b.last_name?.[0]}
      </div>
    )}

    {/* Borrower Info */}
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {b.first_name} {b.middle_name ?? ""} {b.last_name}
          </h2>

          <p className="mt-0.5 truncate text-xs text-gray-500">
            📞 {b.contact_number || t("borrowers.no_contact")}
          </p>

          <p className="text-[11px] text-gray-500">
            {t("borrowers.age_label")} {calculateAge(b.dob)}
          </p>
        </div>

        {/* Balance */}
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            {t("borrowers.balance")}
          </p>

          <p className="text-sm font-bold text-[#1E3A8A]">
            ₱{Number(b.balance || 0).toLocaleString()}
          </p>

          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              Number(b.balance || 0) <= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {Number(b.balance || 0) <= 0
              ? t("borrowers.paid")
              : t("borrowers.unpaid")}
          </span>
        </div>
      </div>
    </div>
  </div>
</article>
            </Link>
          ))}

        {!loading && filteredBorrowers.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">📭</p>
            <h3 className="mt-3 text-base font-semibold text-gray-800">
              {t("borrowers.empty_title")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("borrowers.empty_hint")}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredBorrowers.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 pb-24">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("borrowers.prev")}
          </button>

          <span className="text-sm font-medium text-gray-600">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("borrowers.next")}
          </button>
        </div>
      )}

      {/* Floating Footer Actions */}
      {!loading && filteredBorrowers.length > 0 && (
<div className="fixed bottom-0 left-0 z-30 w-full border-t border-gray-200 bg-white/95 backdrop-blur">
  <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 p-3">

    {/* Add Borrower */}
    <button
      onClick={() => setIsAddBorrowerOpen(true)}
      className="flex flex-col items-center justify-center rounded-xl bg-green-600 py-2 text-white shadow-sm transition hover:bg-green-700"
    >
      <span className="text-lg">＋</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("borrowers.add_borrower")}
      </span>
    </button>

    {/* Export CSV */}
    <button
      onClick={handleExportCSV}
      className="flex flex-col items-center justify-center rounded-xl bg-[#1E3A8A] py-2 text-white shadow-sm transition hover:bg-[#172f70]"
    >
      <span className="text-lg">📄</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("common.export_csv")}
      </span>
    </button>

    {/* Export PDF */}
    <button
      onClick={handleExportPDF}
      className="flex flex-col items-center justify-center rounded-xl bg-[#DC2626] py-2 text-white shadow-sm transition hover:bg-[#B91C1C]"
    >
      <span className="text-lg">📕</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("common.export_pdf")}
      </span>
    </button>

    {/* Archived */}
    <button
      onClick={() => setIsArchivedOpen(true)}
      className="flex flex-col items-center justify-center rounded-xl border border-[#1E3A8A] py-2 text-[#1E3A8A] shadow-sm transition hover:bg-blue-50"
    >
      <span className="text-lg">📦</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("borrowers.archive")}
      </span>
    </button>
  </div>
</div>
      )}
      <GlobalModal
  isOpen={globalModal.isOpen}
  title={globalModal.title}
  message={globalModal.message}
  type={globalModal.type as any}
  onClose={() => {
    setGlobalModal({
      ...globalModal,
      isOpen: false,
    });
    clearBorrowerError();
  }}
/>
    </div>
  );
}