import { useEffect, useState } from "react";
import { useLoan } from "../../context/loans/useLoan";
import { useProduct } from "../../context/products/useProduct";
import { createReminderApi } from "../../context/collection-reminders/collectionReminderApi";
import ProductModal from "../../products/modals/ProductModal";
import GlobalModal from "../../../shared/components/GlobalModal";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrowerId: number;
  borrowerName: string;
  profileImageUrl?: string;
  onLoanCreated?: (totalAmount: number) => Promise<void> | void;
}

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
}
export default function AddLoanModalBorrowerDetails({
  isOpen,
  isClose,
  borrowerId,
  borrowerName,
  profileImageUrl,
  onLoanCreated,
}: Props) {
const { createLoan, error: loanError, clearError: clearLoanError } = useLoan();
const { products, fetchProducts, createProduct, error: productError, clearError: clearProductError } = useProduct();
const isOnline = useOnlineStatus();

  const [animate, setAnimate] = useState(false);

const [items, setItems] = useState([
  { product: "", product_id: null as number | null, quantity: "1", price: "" },
]);

const [isProductModalOpen, setIsProductModalOpen] = useState(false);
const [newProductName, setNewProductName] = useState("");

const [globalModal, setGlobalModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
});

const [showReminderPrompt, setShowReminderPrompt] = useState(false);
const [reminderLoanTotal, setReminderLoanTotal] = useState(0);
const [reminderDate, setReminderDate] = useState(() => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
});

useEffect(() => {
  if (loanError) {
    setGlobalModal({ isOpen: true, title: "Error", message: loanError, type: "error" });
  }
}, [loanError]);

useEffect(() => {
  if (productError) {
    setGlobalModal({ isOpen: true, title: "Error", message: productError, type: "error" });
  }
}, [productError]);

  // -----------------------------
  // Modal animation
  // -----------------------------

useEffect(() => {
  if (isOpen) {
    clearLoanError();
    clearProductError();
    fetchProducts();
    setTimeout(() => setAnimate(true), 10);
  } else {
    setAnimate(false);
  }
}, [isOpen]);
  if (!isOpen) return null;

  // -----------------------------
  // Loan items logic
  // -----------------------------

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addNewItem = () => {
    setItems([
  ...items,
  { product: "", product_id: null, quantity: "1", price: "" },
]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // -----------------------------
  // Save loan
  // -----------------------------

  const handleSubmit = async () => {
    const hasEmpty = items.some((i) => !i.product || !i.price);
    if (hasEmpty) {
      setGlobalModal({
        isOpen: true,
        title: "Required Fields",
        message: "Please fill in all product names and prices.",
        type: "warning",
      });
      return;
    }

    const payload = {
      borrower_id: borrowerId,
      items: items.map((i) => ({
        product_name: i.product,
        product_id: i.product_id,
        quantity: Number(i.quantity),
        price: Number(i.price),
      })),
    };

    const res = await createLoan(payload);

if (!res?.ok) {
  setGlobalModal({
    isOpen: true,
    title: "Error",
    message: res?.message || "Failed to create loan",
    type: "error",
  });
  return;
}

    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.price),
      0
    );
    await onLoanCreated?.(totalAmount);

    // Show reminder prompt instead of closing
    setReminderLoanTotal(totalAmount);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setReminderDate(defaultDate.toISOString().split("T")[0]);
    setShowReminderPrompt(true);
  };

  const handleSetReminder = async () => {
    await createReminderApi({
      borrower_id: borrowerId,
      amount_expected: reminderLoanTotal,
      due_date: reminderDate,
    });
    setShowReminderPrompt(false);
    isClose();
  };

  const handleSkipReminder = () => {
    setShowReminderPrompt(false);
    isClose();
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
        {showReminderPrompt ? (
          /* Reminder Prompt */
          <>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                    Collection Reminder
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Set due date for this loan</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200/80 p-5 text-center shadow-2xs">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-wide">Loan recorded!</p>
                <p className="text-3xl font-black text-emerald-950 mt-1">
                  ₱{reminderLoanTotal.toLocaleString()}
                </p>
              </div>

              <p className="text-xs font-semibold text-slate-600 text-center">
                When do you want to collect from <span className="font-black text-slate-950">{borrowerName}</span>?
              </p>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Collection date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkipReminder}
                className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 py-3 text-xs sm:text-sm font-black text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSetReminder}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                Set Reminder
              </button>
            </div>
          </>
        ) : (
          /* Loan Form */
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                    Add Loan
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Record items or credit for borrower</p>
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

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Selected Borrower Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4 flex items-center gap-3.5 shadow-2xs">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={borrowerName || "Borrower"}
                    className="h-12 w-12 rounded-2xl border-2 border-white object-cover shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-sm font-black shadow-xs shrink-0">
                    {borrowerName
                      ? borrowerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "B"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selected Borrower
                  </p>
                  <p className="text-sm font-black text-slate-950 truncate mt-0.5">
                    {borrowerName}
                  </p>
                </div>

                <span className="rounded-xl bg-blue-100/80 text-blue-700 px-2.5 py-1 text-[11px] font-black shrink-0">
                  Active
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Loan Items
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={item.product}
                          onChange={(e) => {
                            const selectedProduct = products.find(
                              (p: Product) => p.product_name === e.target.value
                            );

                            const updated = [...items];
                            updated[index] = {
                              ...updated[index],
                              product: selectedProduct?.product_name || "",
                              product_id: selectedProduct?.product_id || null,
                              price: selectedProduct
                                ? String(selectedProduct.product_price)
                                : "",
                            };
                            setItems(updated);
                          }}
                          className="w-full appearance-none rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-4 pr-10 text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition shadow-2xs cursor-pointer"
                        >
                          <option value="">Select product...</option>
                          {products.map((product: Product) => (
                            <option key={product.product_id} value={product.product_name}>
                              {product.product_name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addNewItem}
                        title="Add another item row"
                        className="h-11 w-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {item.product.trim() &&
                      !products.some(
                        (p: any) => p.product_name.toLowerCase() === item.product.toLowerCase()
                      ) && (
                        isOnline ? (
                          <button
                            type="button"
                            onClick={() => {
                              setNewProductName(item.product);
                              setIsProductModalOpen(true);
                            }}
                            className="w-full rounded-2xl border border-dashed border-blue-400 bg-blue-50/80 px-3.5 py-2.5 text-left text-xs font-bold text-blue-700 transition hover:bg-blue-100/80 cursor-pointer flex items-center justify-between"
                          >
                            <span>+ Save "{item.product}" to catalog</span>
                            <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-lg text-blue-600">Quick Add</span>
                          </button>
                        ) : (
                          <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-400">
                            Go online to add new products to store catalog
                          </div>
                        )
                      )}

                    <div className="flex items-center gap-2.5">
                      <div className="w-1/2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition shadow-2xs"
                        />
                      </div>

                      <div className="w-1/2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Unit Price (₱)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-500 text-xs pointer-events-none">
                            ₱
                          </span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            readOnly
                            className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/90 pl-8 pr-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-xs font-black text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1 pt-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Remove this item</span>
                      </button>
                    )}

                    {/* Subtotal Pill */}
                    {Number(item.quantity) > 0 && Number(item.price) > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="text-[11px] font-bold text-slate-400">Subtotal</span>
                        <span className="font-black text-slate-900">
                          ₱{(Number(item.quantity) * Number(item.price)).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Total and Actions */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-100 space-y-4">
              {/* Total Calculation Card */}
              <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-200/90 px-5 py-3 shadow-2xs">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Total Loan
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-950">
                  ₱{totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isClose}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 py-3.5 text-xs sm:text-sm font-black text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer text-center"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Loan</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        isClose={() => setIsProductModalOpen(false)}
        mode="add"
        onSubmit={createProduct}
        initialProductName={newProductName}
      />

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
          clearLoanError();
          clearProductError();
        }}
      />
    </div>
  );
}