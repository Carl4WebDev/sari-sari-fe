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
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                Archived Borrowers
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Inactive borrowers directory</p>
            </div>
          </div>

          <button
            onClick={isClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archived borrowers..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-11 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
            />
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 text-xs font-semibold text-slate-500 text-center">
              Loading archived borrowers...
            </div>
          )}

          {!loading && (filteredBorrowers || []).length === 0 && (
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-xs font-black text-slate-900">
                No archived borrowers
              </p>
              <p className="text-[11px] font-semibold text-slate-400">
                Archived borrowers will appear here.
              </p>
            </div>
          )}

          {!loading &&
            (filteredBorrowers || []).map((b: any) => (
              <div
                key={b.borrower_id}
                className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  {b.profile_image_url ? (
                    <img
                      src={resolveImageUrl(b.profile_image_url)}
                      alt={`${b.first_name} ${b.last_name}`}
                      className="h-12 w-12 rounded-2xl border-2 border-white shadow-xs object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-900 border border-blue-100">
                      {b.first_name?.[0]}
                      {b.last_name?.[0]}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-950">
                      {b.first_name} {b.middle_name ?? ""} {b.last_name}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {b.contact_number || "No contact"}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Age: {calculateAge(b.dob)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400">Balance</p>
                    <p className="text-xs font-black text-blue-900 mt-0.5">
                      ₱{Number(b.balance || 0).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-xl bg-slate-200/80 px-2.5 py-1 text-[11px] font-black text-slate-700">
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
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
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