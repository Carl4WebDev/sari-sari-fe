import { useEffect, useState } from "react";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { useLoan } from "../../context/loans/useLoan";
import { useProduct } from "../../context/products/useProduct";
import { createReminderApi } from "../../context/collection-reminders/collectionReminderApi";
import ProductModal from "../../products/modals/ProductModal";
import GlobalModal from "../../../shared/components/GlobalModal";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Borrower {
  borrower_id: number;
  first_name: string;
  last_name: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
}

interface Props {
  isOpen: boolean;
  isClose?: () => void;
  onClose?: () => void;
  onLoanCreated?: () => Promise<void> | void;
  onSuccess?: () => Promise<void> | void;
  autoOpenProducts?: boolean;
  onProductSaved?: () => void;
  mode?: "full" | "quick";
  onQuickLoanSaved?: (amount: number, borrowerName: string, newBalance: number) => void;
}

export default function AddLoanModal({
  isOpen,
  isClose: isCloseProp,
  onClose: onCloseProp,
  onLoanCreated,
  onSuccess,
  autoOpenProducts,
  onProductSaved,
  mode = "full",
  onQuickLoanSaved,
}: Props) {
  const isClose = onCloseProp || isCloseProp || (() => {});
  const { t } = useTranslation();

  const { borrowers, fetchBorrowers } = useBorrower();
  const { createLoan, error: loanError, clearError: clearLoanError } = useLoan();
  const { products, fetchProducts, createProduct, error: productError, clearError: clearProductError } = useProduct();
  const isOnline = useOnlineStatus();

  const [search, setSearch] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  const [items, setItems] = useState([
    { product: "", product_id: null as number | null, quantity: "1", price: "" },
  ]);

  const [quickCashMode, setQuickCashMode] = useState(true);
  const [quickAmount, setQuickAmount] = useState("");
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

  const resetLoanForm = () => {
    setSearch("");
    setSelectedBorrower(null);
    setItems([{ product: "", product_id: null, quantity: "1", price: "" }]);
    setShowReminderPrompt(false);
    setQuickCashMode(true);
    setQuickAmount("");
    localStorage.removeItem("active_borrower_id");
  };

  useEffect(() => {
    if (!isOpen) return;

    clearLoanError();
    clearProductError();
    fetchBorrowers();
    fetchProducts();

    const activeId = localStorage.getItem("active_borrower_id");
    if (activeId) {
      const borrower = borrowers.find(
        (b) => b.borrower_id === Number(activeId)
      );

      if (borrower) {
        setSelectedBorrower(borrower);
        setSearch(`${borrower.first_name} ${borrower.last_name}`);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoOpenProducts) {
      const timer = setTimeout(() => {
        setIsProductModalOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoOpenProducts]);

  if (!isOpen) return null;

  const filteredBorrowers = borrowers.filter((b: any) =>
    `${b.first_name} ${b.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

  const handleProductSubmit = async (payload: { product_name: string; product_price: number }) => {
    const res = await createProduct(payload);
    if (res?.ok) {
      onProductSaved?.();
    }
    return res;
  };

  const handleSubmit = async () => {
    if (!selectedBorrower) {
      setGlobalModal({
        isOpen: true,
        title: "Required",
        message: "Please select a borrower.",
        type: "warning",
      });
      return;
    }

    let loanItems;

    if (mode === "quick") {
      if (quickCashMode) {
        if (!quickAmount || Number(quickAmount) <= 0) {
          setGlobalModal({
            isOpen: true,
            title: t("loan.required"),
            message: "Please enter an amount.",
            type: "warning",
          });
          return;
        }
        loanItems = [{
          product_name: t("dashboard.today.cash_loan"),
          product_id: null,
          quantity: 1,
          price: Number(quickAmount),
        }];
      } else {
        const validItems = items.filter((i) => i.product && i.price);
        if (validItems.length === 0) {
          setGlobalModal({
            isOpen: true,
            title: t("loan.required"),
            message: "Please select at least one product.",
            type: "warning",
          });
          return;
        }
        loanItems = validItems.map((i) => ({
          product_name: i.product,
          product_id: i.product_id,
          quantity: Number(i.quantity) || 1,
          price: Number(i.price),
        }));
      }
    } else {
      loanItems = items.map((i) => ({
        product_name: i.product,
        product_id: i.product_id,
        quantity: Number(i.quantity),
        price: Number(i.price),
      }));
    }

    const payload = {
      borrower_id: selectedBorrower.borrower_id,
      items: loanItems,
    };

    const loanOptions = (selectedBorrower as any)._pending && (selectedBorrower as any)._queuedItemId
      ? { dependsOn: (selectedBorrower as any)._queuedItemId, dependencyField: "borrower_id" }
      : {};

    const res = await createLoan(payload, loanOptions);

    if (!res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: "Error",
        message: res?.message || "Failed to create loan",
        type: "error",
      });
      return;
    }

    await onLoanCreated?.();

    if (mode === "quick") {
      const total = quickCashMode
        ? Number(quickAmount) || 0
        : items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
      const borrowerName = `${selectedBorrower.first_name} ${selectedBorrower.last_name}`;
      onQuickLoanSaved?.(total, borrowerName, 0);
      resetLoanForm();
      isClose();
      return;
    }

    const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
    setReminderLoanTotal(total);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setReminderDate(defaultDate.toISOString().split("T")[0]);
    setShowReminderPrompt(true);
  };

  const handleSetReminder = async () => {
    if (!selectedBorrower) return;
    await createReminderApi({
      borrower_id: selectedBorrower.borrower_id,
      amount_expected: reminderLoanTotal,
      due_date: reminderDate,
    });
    resetLoanForm();
    isClose();
  };

  const handleSkipReminder = () => {
    resetLoanForm();
    isClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
      >
        {showReminderPrompt ? (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950 tracking-tight">Collection Reminder</h2>
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
                When do you want to collect from <span className="font-black text-slate-950">{selectedBorrower?.first_name}</span>?
              </p>

              <div>
                <label className="text-[11px] font-black text-slate-500 mb-1.5 block">Collection date</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
              <button
                onClick={handleSkipReminder}
                className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleSetReminder}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
              >
                Set Reminder
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950 tracking-tight">
                    {mode === "quick" ? t("loan.quick_title") : "Add Loan"}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Record a cash or product loan</p>
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

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Borrower Search */}
              <div className="space-y-2">
                <input
                  placeholder={t("loan.search_borrower")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
                />

                {search && !selectedBorrower && (
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-md">
                    {filteredBorrowers.map((b: any) => (
                      <div
                        key={b.borrower_id}
                        onClick={() => {
                          setSelectedBorrower(b);
                          setSearch(`${b.first_name} ${b.last_name}`);
                        }}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 cursor-pointer hover:bg-blue-50/80 transition"
                      >
                        {b.first_name} {b.last_name}
                      </div>
                    ))}
                  </div>
                )}

                {selectedBorrower && (
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50/80 border border-blue-200/80 px-4 py-3">
                    <span className="text-xs font-black text-blue-950">
                      {selectedBorrower.first_name} {selectedBorrower.last_name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBorrower(null);
                        setSearch("");
                      }}
                      className="rounded-xl px-2.5 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      {t("loan.change")}
                    </button>
                  </div>
                )}
              </div>

              {mode === "quick" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuickCashMode(true)}
                      className={`flex-1 rounded-2xl py-2.5 text-xs font-black transition cursor-pointer ${
                        quickCashMode
                          ? "bg-slate-950 text-white shadow-md"
                          : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {t("loan.cash_mode")}
                    </button>
                    <button
                      onClick={() => setQuickCashMode(false)}
                      className={`flex-1 rounded-2xl py-2.5 text-xs font-black transition cursor-pointer ${
                        !quickCashMode
                          ? "bg-slate-950 text-white shadow-md"
                          : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {t("loan.product_mode")}
                    </button>
                  </div>

                  {quickCashMode ? (
                    <div>
                      <label className="text-[11px] font-black text-slate-500 mb-1.5 block">Amount (₱)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="0"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 outline-none transition"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="space-y-2 border border-slate-200/90 rounded-3xl p-4 bg-slate-50/40">
                          <div className="flex items-center gap-2">
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
                                  price: selectedProduct ? String(selectedProduct.product_price) : "",
                                };
                                setItems(updated);
                              }}
                              className="flex-1 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                            >
                              <option value="">{t("loan.select_product")}</option>
                              {products.map((product: Product) => (
                                <option key={product.product_id} value={product.product_name}>
                                  {product.product_name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={addNewItem}
                              className="rounded-2xl bg-slate-950 hover:bg-slate-900 text-white px-4 py-2.5 text-xs font-black transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={t("loan.qty")}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="w-1/2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                            />
                            <input
                              type="number"
                              min="1"
                              placeholder={t("loan.price_placeholder")}
                              value={item.price}
                              readOnly
                              className="w-1/2 rounded-2xl border border-slate-200/90 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="space-y-2 border border-slate-200/90 rounded-3xl p-4 bg-slate-50/40">
                      <div className="flex items-center gap-2">
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
                              price: selectedProduct ? String(selectedProduct.product_price) : "",
                            };
                            setItems(updated);
                          }}
                          className="flex-1 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                        >
                          <option value="">{t("loan.select_product")}</option>
                          {products.map((product: Product) => (
                            <option key={product.product_id} value={product.product_name}>
                              {product.product_name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={addNewItem}
                          className="rounded-2xl bg-slate-950 hover:bg-slate-900 text-white px-4 py-2.5 text-xs font-black transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder={t("loan.qty")}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-1/2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder={t("loan.price_placeholder")}
                          value={item.price}
                          readOnly
                          className="w-1/2 rounded-2xl border border-slate-200/90 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-3 bg-white">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 border border-slate-200/90 px-4 py-2.5">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Total</span>
                <span className="text-base font-black text-slate-950">
                  ₱{(mode === "quick" && quickCashMode
                    ? Number(quickAmount) || 0
                    : items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetLoanForm();
                    isClose();
                  }}
                  className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
                >
                  {t("loan.cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
                >
                  {mode === "quick" ? t("loan.save") : t("loan.save_loan")}
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
        initialProductName={newProductName}
        onSubmit={handleProductSubmit}
      />

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => {
          setGlobalModal({ ...globalModal, isOpen: false });
          clearLoanError();
          clearProductError();
        }}
      />
    </div>
  );
}