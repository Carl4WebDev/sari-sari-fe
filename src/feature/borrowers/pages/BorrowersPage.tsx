import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";

export default function BorrowersPage() {
  const [search, setSearch] = useState("");

  const { borrowers, fetchBorrowers, loading } = useBorrower();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBorrowers();
  }, []);

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

  const handleExport = () => {
    console.log("Export borrowers later");
  };

  return (
    <div className="min-h-screen space-y-5 pb-24">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Borrowers</h1>
        <p className="mt-1 text-sm text-blue-100">
          Manage borrower records, loans, and contact details.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs text-blue-100">Total Borrowers</p>
            <p className="text-xl font-bold">{borrowers.length}</p>
          </div>

          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs text-blue-100">Showing</p>
            <p className="text-xl font-bold">{filteredBorrowers.length}</p>
          </div>
        </div>
      </div>

      {/* Search + Export */}
      <div className="sticky top-0 z-10 rounded-2xl border bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              placeholder="Search name or contact..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={handleExport}
            className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172f70] sm:w-auto"
          >
            Export
          </button>
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
              <article className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1E3A8A] hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-4">
                      {b.profile_image_url ? (
                        <img
                          src={b.profile_image_url}
                          alt={`${b.first_name} ${b.last_name}`}
                          className="h-20 w-20 shrink-0 rounded-full border-4 border-[#1E3A8A] object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-red-600 bg-red-100 text-xl font-bold text-red-700 shadow-sm">
                          {b.first_name?.[0]}
                          {b.last_name?.[0]}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-gray-900">
                          {b.first_name} {b.middle_name ?? ""} {b.last_name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          📞 {b.contact_number || "No contact number"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Age: {calculateAge(b.dob)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3 text-left sm:min-w-[150px] sm:text-right">
                    <p className="text-xs font-medium text-gray-500">
                      Total Balance
                    </p>

                    <p className="text-xl font-bold text-[#1E3A8A]">
                      ₱{Number(b.total_loan || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))}

        {!loading && filteredBorrowers.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">📭</p>
            <h3 className="mt-3 text-base font-semibold text-gray-800">
              No borrowers found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching another name or contact number.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredBorrowers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 shadow-lg sm:static sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 sm:justify-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>

            <span className="text-sm font-medium text-gray-600">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}