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

  useEffect(() => {
    if (isOpen) {
      onFetchArchived();
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
              Archived Products
            </h2>

            <button
              onClick={isClose}
              className="rounded-lg border px-3 py-2 text-sm text-gray-600"
            >
              Close
            </button>
          </div>

          {loading && (
            <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
              Loading archived products...
            </div>
          )}

          {!loading && archivedProducts.length === 0 && (
            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <p className="text-3xl">📦</p>
              <p className="mt-2 text-sm font-semibold text-gray-700">
                No archived products
              </p>
              <p className="text-xs text-gray-500">
                Archived products will appear here.
              </p>
            </div>
          )}

          {!loading &&
            archivedProducts.map((p: any) => (
              <div
                key={p.product_id}
                className="rounded-xl border bg-white p-4 shadow-sm space-y-3"
              >
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {p.product_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    Product ID: {p.product_id}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-bold text-[#1E3A8A]">
                      ₱{Number(p.product_price || 0).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                    Archived
                  </span>
                </div>

                <button
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Reactivate this product?"
                    );

                    if (!confirmed) return;

                    await onReactivate(p.product_id);
                  }}
                  className="w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white"
                >
                  Reactivate Product
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}