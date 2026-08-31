import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";

import ArchivedBorrowersModal from "../modals/ArchivedBorrowersModal";

import GlobalModal from "../../../shared/components/GlobalModal";
import AddBorrowerModal from "../../dashboard/modals/AddBorrowerModal";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";

export default function BorrowersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
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

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const itemsPerPage = 12;

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
      `${b.first_name} ${b.middle_name ?? ""} ${b.last_name} ${b.contact_number || b.phone_number || ""}`
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
      b.contact_number || b.phone_number || "",
      b.dob ?? "",
      calculateAge(b.dob),
      Number(b.balance || b.total_loan || 0),
      Number(b.balance || b.total_loan || 0) <= 0 ? t("borrowers.fully_paid") : t("borrowers.with_balance"),
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

  const handleExportPDF = async () => {
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
    const { generateBorrowersPDF } = await import("../../../shared/utils/exportToPDF");
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
    <div className="space-y-6 pb-28 relative min-h-full">
      {!isOnline && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs md:text-sm text-amber-800 flex items-center gap-2 font-semibold shadow-xs">
          <svg className="w-5 h-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{t("offline_reminder.read_only") || "Offline Mode — viewing cached data."}</span>
        </div>
      )}

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

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t("borrowers.title")}</h1>
              <span className="rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs font-extrabold px-3 py-0.5">
                {borrowers.length} {t("nav.borrowers")}
              </span>
            </div>
            <p className="mt-1 text-xs md:text-sm text-slate-400 font-medium">
              {t("borrowers.subtitle")}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isOnline && (
              <button
                onClick={() => setIsAddBorrowerOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 py-2.5 px-4 text-white shadow-xs transition cursor-pointer font-black text-xs sm:text-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("borrowers.add_borrower")}</span>
              </button>
            )}

            <button
              onClick={() => setIsArchivedOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 py-2.5 px-3.5 text-slate-200 shadow-2xs transition cursor-pointer font-extrabold text-xs sm:text-sm active:scale-95"
              title="View Archived Borrowers"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>{t("borrowers.archived")}</span>
            </button>
          </div>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("borrowers.total_borrowers")}</p>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">{borrowers.length}</p>
          </div>

          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("borrowers.showing")}</p>
            <p className="text-2xl md:text-3xl font-black text-blue-400 mt-1">{filteredBorrowers.length}</p>
          </div>

          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("borrowers.with_balance")}</p>
            <p className="text-2xl md:text-3xl font-black text-rose-400 mt-1">
              {borrowers.filter((b: any) => Number(b.balance || b.total_loan || 0) > 0).length}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("borrowers.fully_paid")}</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
              {borrowers.filter((b: any) => Number(b.balance || b.total_loan || 0) <= 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Search & Export Bar */}
      <div className="sticky top-0 z-20 pt-1">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>

            <input
              placeholder={t("borrowers.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-xs sm:text-sm font-semibold shadow-xs outline-none focus:border-blue-600 transition"
            />
          </div>

          {/* Export Buttons in Search Toolbar */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 py-3 px-3.5 text-slate-800 shadow-2xs transition cursor-pointer font-extrabold text-xs sm:text-sm active:scale-95"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{t("common.export_csv")}</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 py-3 px-3.5 text-slate-800 shadow-2xs transition cursor-pointer font-extrabold text-xs sm:text-sm active:scale-95"
            >
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{t("common.export_pdf")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Borrower Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500 text-center shadow-xs">
            Loading borrowers...
          </div>
        )}

        {!loading &&
          paginatedBorrowers.map((b: any) => {
            const balance = Number(b.balance || b.total_loan || 0);
            const isPaid = balance <= 0;

            return (
              <Link
                key={b.borrower_id}
                to={`/borrowers/${b.borrower_id}`}
                className="block group"
              >
                <article className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    {/* Profile Avatar */}
                    {b.profile_image_url ? (
                      <img
                        src={resolveImageUrl(b.profile_image_url)}
                        alt={`${b.first_name} ${b.last_name}`}
                        className="h-12 w-12 shrink-0 rounded-2xl border-2 border-white object-cover shadow-2xs"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-xs font-black text-white shadow-2xs border border-slate-800">
                        {b.first_name?.[0]}
                        {b.last_name?.[0]}
                      </div>
                    )}

                    {/* Borrower Info */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h2 className="truncate text-sm font-black text-slate-950 group-hover:text-blue-600 transition">
                        {b.first_name} {b.middle_name ? `${b.middle_name} ` : ""}{b.last_name}
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold truncate">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{b.contact_number || b.phone_number || t("borrowers.no_contact")}</span>
                      </div>

                      <p className="text-[11px] font-bold text-slate-400">
                        {t("borrowers.age_label")} {calculateAge(b.dob)}
                      </p>
                    </div>
                  </div>

                  {/* Balance & Status */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                        {t("borrowers.balance")}
                      </p>

                      <p className="text-base sm:text-lg font-black text-slate-950">
                        ₱{balance.toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black shadow-2xs ${
                        isPaid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                          : "bg-rose-50 text-rose-700 border border-rose-200/80"
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{t("borrowers.paid")}</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>{t("borrowers.unpaid")}</span>
                        </>
                      )}
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}

        {!loading && filteredBorrowers.length === 0 && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xs space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {t("borrowers.empty_title")}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              {t("borrowers.empty_hint")}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredBorrowers.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition"
          >
            {t("borrowers.prev")}
          </button>

          <span className="text-xs font-extrabold text-slate-700 px-3">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition"
          >
            {t("borrowers.next")}
          </button>
        </div>
      )}

      <GlobalModal
        isOpen={globalModal.isOpen}
        onClose={() => setGlobalModal((prev) => ({ ...prev, isOpen: false }))}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
      />
    </div>
  );
}