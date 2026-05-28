import { useEffect, useState } from "react";
import { calculateAge } from "../../components/utility/calculateAge";
import { resolveImageUrl } from "../../../shared/utils/resolveImageUrl";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  archivedBorrowers: any[];
  loading: boolean;
  onFetchArchived: () => void;
  onReactivate: (borrowerId: number) => Promise<any>;
}

export default function ArchivedBorrowersModal({
  isOpen,
  isClose,
  archivedBorrowers = [],
  loading,
  onFetchArchived,
  onReactivate,
}: Props) {
  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      onFetchArchived();
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredBorrowers = archivedBorrowers.filter(
  (b: any) =>
    `${b.first_name} ${b.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 left-0 w-full bg-white
          rounded-b-2xl shadow-xl
          transform transition-transform duration-300 ease-out
          ${animate ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="max-h-[85vh] overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1E3A8A]">
              Archived Borrowers
            </h2>

            <button
              onClick={isClose}
              className="rounded-lg border px-3 py-2 text-sm text-gray-600"
            >
              Close
            </button>
          </div>

          {/* Search */}
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
    🔍
  </span>

  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search archived borrowers..."
    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
  />
</div>

          {loading && (
            <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
              Loading archived borrowers...
            </div>
          )}

          {!loading && (filteredBorrowers || []).length === 0 && (
            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <p className="text-3xl">📦</p>
              <p className="mt-2 text-sm font-semibold text-gray-700">
                No archived borrowers
              </p>
              <p className="text-xs text-gray-500">
                Archived borrowers will appear here.
              </p>
            </div>
          )}

          {!loading &&
            (filteredBorrowers || []).map((b: any) => (
              <div
                key={b.borrower_id}
                className="rounded-xl border bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  {b.profile_image_url ? (
                    <img
                      src={resolveImageUrl(b.profile_image_url)}
                      alt={`${b.first_name} ${b.last_name}`}
                      className="h-14 w-14 rounded-full border-2 border-gray-300 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700">
                      {b.first_name?.[0]}
                      {b.last_name?.[0]}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {b.first_name} {b.middle_name ?? ""} {b.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      📞 {b.contact_number || "No contact"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Age: {calculateAge(b.dob)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-sm font-bold text-[#1E3A8A]">
                      ₱{Number(b.balance || 0).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                    Archived
                  </span>
                </div>

                <button
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Reactivate this borrower?"
                    );

                    if (!confirmed) return;

                    await onReactivate(b.borrower_id);
                  }}
                  className="w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white"
                >
                  Reactivate Borrower
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}