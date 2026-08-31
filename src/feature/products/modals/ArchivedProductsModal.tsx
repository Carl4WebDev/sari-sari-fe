import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  archivedProducts?: any[];
  loading: boolean;
  onFetchArchived: () => void;
  onReactivate: (productId: number) => Promise<any>;
}

export default function ArchivedProductsModal({
  isOpen,
  isClose,
  archivedProducts = [],
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
  const filteredProducts = archivedProducts.filter((p: any) =>
  p.product_name
    ?.toLowerCase()
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2m-14 0v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                Archived Products
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Inactive items directory</p>
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archived products..."
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3.5 pl-11 pr-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
            />
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-xs sm:text-sm font-bold text-slate-500 text-center">
              Loading archived products...
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 sm:p-10 text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100/80 shadow-2xs">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2m-14 0v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  No archived products
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1 max-w-xs mx-auto">
                  All items are currently active in your catalog. Archived products will show up here.
                </p>
              </div>
            </div>
          )}

          {!loading &&
            filteredProducts.map((p: any) => (
              <div
                key={p.product_id}
                className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950 truncate">
                      {p.product_name}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      Product ID: #{p.product_id}
                    </p>
                  </div>

                  <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 shrink-0">
                    Archived
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 border border-slate-100 p-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400">Retail Price</p>
                    <p className="text-sm font-black text-blue-950 mt-0.5">
                      ₱{Number(p.product_price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Reactivate "${p.product_name}"?`
                    );

                    if (!confirmed) return;

                    await onReactivate(p.product_id);
                  }}
                  className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800 py-3 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reactivate Product</span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}