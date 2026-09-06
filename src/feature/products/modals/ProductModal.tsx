import { useEffect, useMemo, useState } from "react";
import GlobalModal from "../../../shared/components/GlobalModal";
import { PRODUCT_SUGGESTIONS } from "../constants/productSuggestions";

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  created_at?: string;
}

interface Props {
  isOpen: boolean;
  isClose: () => void;
  mode: "add" | "edit";
  product?: Product | null;
  loading?: boolean;
  initialProductName?: string;
  onSubmit: (payload: {
    product_name: string;
    product_price: number;
  }) => Promise<any>;
}

export default function ProductModal({
  isOpen,
  isClose,
  mode,
  product,
  loading,
  initialProductName,
  onSubmit,
}: Props) {
  const [animate, setAnimate] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    price: "",
  });

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);

      if (mode === "edit" && product) {
        setForm({
          product_name: product.product_name || "",
          price: String(product.product_price || ""),
        });
      }

      if (mode === "add") {
        setForm({
          product_name: initialProductName || "",
          price: "",
        });
      }
    } else {
      setAnimate(false);
      setShowSuggestions(false);
    }
  }, [isOpen, mode, product]);

  const filteredSuggestions = useMemo(() => {
    if (!form.product_name.trim()) {
      return PRODUCT_SUGGESTIONS.slice(0, 15);
    }

    return PRODUCT_SUGGESTIONS.filter((item) =>
      item
        .toLowerCase()
        .includes(form.product_name.toLowerCase())
    ).slice(0, 15);
  }, [form.product_name]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.product_name.trim()) {
      setGlobalModal({
        isOpen: true,
        title: "Missing Product",
        message: "Product name is required",
        type: "error",
      });

      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setGlobalModal({
        isOpen: true,
        title: "Invalid Price",
        message: "Valid price is required.",
        type: "error",
      });

      return;
    }

    const res = await onSubmit({
      product_name: form.product_name.trim(),
      product_price: Number(form.price),
    });

    if (!res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: res?.message || "Something went wrong",
        type: "error",
      });
      return;
    }

    if (res?.ok) {
      isClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border ${
              mode === "add"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100/80"
                : "bg-blue-50 text-blue-600 border-blue-100/80"
            }`}>
              {mode === "add" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                {mode === "add" ? "Add Product" : "Edit Product"}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {mode === "add" ? "Enter product name and selling price" : "Update product information"}
              </p>
            </div>
          </div>

          <button
            onClick={isClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer active:scale-95"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Product Name Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Product Name
              </label>
              <span className="text-[11px] font-bold text-slate-400">Required</span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </span>

              <input
                value={form.product_name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => handleChange("product_name", e.target.value)}
                placeholder="Search or type product (e.g. Pancit Canton, Coke)..."
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3.5 pl-11 pr-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-2 space-y-1 max-h-56 overflow-y-auto">
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  <span>Quick Suggestions</span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                {filteredSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        product_name: item,
                      }));
                      setShowSuggestions(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  >
                    <span>{item}</span>
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Price
              </label>
              <span className="text-[11px] font-bold text-slate-400">PHP (₱)</span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-600 text-sm pointer-events-none">
                ₱
              </span>

              <input
                type="number"
                step="any"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Example: 25"
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3.5 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={isClose}
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 py-3 text-xs sm:text-sm font-black text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl bg-emerald-700 hover:bg-emerald-800 py-3 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{mode === "add" ? "Save Product" : "Update Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() =>
          setGlobalModal({
            ...globalModal,
            isOpen: false,
          })
        }
      />
    </div>
  );
}