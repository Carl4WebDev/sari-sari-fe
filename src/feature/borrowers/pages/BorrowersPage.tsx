import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { calculateAge } from "../../components/utility/calculateAge";

export default function BorrowersPage() {
  const [search, setSearch] = useState("");

  const { borrowers, fetchBorrowers, loading } = useBorrower();

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b: any) =>
      `${b.first_name} ${b.last_name} ${b.contact_number}`
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
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">Borrowers</h1>
        <p className="text-sm text-gray-500">
          Manage and monitor borrower records
        </p>
      </div>

      {/* Search + Export */}
      <div className="flex flex-wrap gap-3 justify-center">
        <input
          placeholder="Search borrower..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
        />

        <button
          onClick={handleExport}
          className="rounded-lg bg-[#1E3A8A] p-4 w-full md:w-1/6 text-sm font-medium text-white"
        >
          Export
        </button>
      </div>

      {/* Borrower List */}
      <div className="border rounded-xl bg-white shadow-sm overflow-x-auto">
        <div className="max-h-[420px] overflow-y-auto">

          {loading && (
            <p className="text-sm text-gray-500 p-4">Loading borrowers...</p>
          )}

          {!loading &&
            paginatedBorrowers.map((b: any) => (
              <Link
                key={b.borrower_id}
                to={`/borrowers/${b.borrower_id}`}
                className="block border-b last:border-none"
              >
                <div className="p-4 hover:bg-gray-50 transition">

                  <div className="flex justify-between items-start min-w-[500px]">

                    <div>
                      <p className="text-base font-semibold text-gray-800">
                        {b.first_name} {b.middle_name ?? ""} {b.last_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        📞 {b.contact_number}
                      </p>

                      <p className="text-sm text-gray-500">
                        Age: {calculateAge(b.dob)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Loan</p>

                      <p className="text-lg font-bold text-[#1E3A8A]">
                        ₱{b.total_loan}
                      </p>
                    </div>

                  </div>

                </div>
              </Link>
            ))}

          {!loading && filteredBorrowers.length === 0 && (
            <p className="text-center text-sm text-gray-500 p-4">
              No borrowers found.
            </p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredBorrowers.length > 0 && (
        <div className="flex justify-center gap-2">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
}