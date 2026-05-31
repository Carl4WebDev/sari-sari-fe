import { useEffect, useState } from "react";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { useLoan } from "../../context/loans/useLoan";
import { useProduct } from "../../context/products/useProduct";
import { createReminderApi } from "../../context/collection-reminders/collectionReminderApi";
import ProductModal from "../../products/modals/ProductModal";
import GlobalModal from "../../../shared/components/GlobalModal";

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
  isClose: () => void;
  onLoanCreated?: () => Promise<void> | void;
  autoOpenProducts?: boolean;
  onProductSaved?: () => void;
}

export default function AddLoanModal({
  isOpen,
  isClose,
  onLoanCreated,
  autoOpenProducts,
  onProductSaved,
}: Props) {

  const { borrowers, fetchBorrowers } = useBorrower();
  const { createLoan, error: loanError, clearError: clearLoanError } = useLoan();
  const { products, fetchProducts, createProduct, error: productError, clearError: clearProductError } = useProduct();

  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

const [items, setItems] = useState([
  { product: "", product_id: null as number | null, quantity: "1", price: "" },
]);

const [isProductModalOpen, setIsProductModalOpen] =
  useState(false);

const [newProductName, setNewProductName] =
  useState("");

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

  localStorage.removeItem("active_borrower_id");
};

  // -----------------------------
  // Load borrowers
  // -----------------------------

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

  // -----------------------------
  // Auto-open ProductModal for tutorial
  // -----------------------------

  useEffect(() => {
    if (isOpen && autoOpenProducts) {
      // Small delay to let the loan modal animate in first
      const timer = setTimeout(() => {
        setIsProductModalOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoOpenProducts]);

  // -----------------------------
  // Modal animation
  // -----------------------------

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // -----------------------------
  // Borrower filtering
  // -----------------------------

  const filteredBorrowers = borrowers.filter((b) =>
    `${b.first_name} ${b.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
  // Voice search
  // -----------------------------

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported on this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
    };

    recognition.start();
  };

  // -----------------------------
  // Save loan
  // -----------------------------

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

    // Block loan creation for borrowers that haven't synced yet
    if (selectedBorrower._pending) {
      setGlobalModal({
        isOpen: true,
        title: "Please wait",
        message: "This borrower is still syncing. Please wait for the sync to complete before creating a loan.",
        type: "warning",
      });
      return;
    }

    const payload = {
      borrower_id: selectedBorrower.borrower_id,
      items: items.map((i) => ({
        product_name: i.product,
        product_id: i.product_id,
        quantity: Number(i.quantity),
        price: Number(i.price),
      })),
    };

    // Pass dependency info so queue can resolve real borrower_id after sync
    const loanOptions = selectedBorrower._queuedItemId
      ? { dependsOn: selectedBorrower._queuedItemId, dependencyField: "borrower_id" }
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

  // Show reminder prompt instead of closing
  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  setReminderLoanTotal(total);
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  setReminderDate(defaultDate.toISOString().split("T")[0]);
  setShowReminderPrompt(true);
  }

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
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
<div
  onClick={(e) => e.stopPropagation()}
  className={`
    fixed top-0 left-0 flex h-screen w-full flex-col bg-white
    rounded-b-2xl shadow-xl
    transform transition-transform duration-300 ease-out
    ${animate ? "translate-y-0" : "-translate-y-full"}
  `}
>
        {showReminderPrompt ? (
          /* Reminder Prompt */
          <>
            <div className="shrink-0 p-6 pb-4">
              <h2 className="text-lg font-semibold text-[#1E3A8A]">
                Collection Reminder
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                <p className="text-sm text-green-700 font-medium">Loan saved!</p>
                <p className="text-lg font-bold text-green-800 mt-1">
                  ₱{reminderLoanTotal.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-600 text-center">
                When do you want to collect from <span className="font-semibold">{selectedBorrower?.first_name}</span>?
              </p>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Collection date</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                />
              </div>
            </div>
            <div className="shrink-0 border-t border-gray-100 p-6 pt-4 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleSkipReminder}
                  className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={handleSetReminder}
                  className="w-1/2 rounded-xl bg-[#16A34A] py-3 text-sm text-white"
                >
                  Set Reminder
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Loan Form */
          <>
        {/* Sticky Header */}
        <div className="shrink-0 p-6 pb-4">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Add Loan
          </h2>

          {/* Borrower Search */}
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Search borrower..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
              />
              <button
                onClick={handleVoiceSearch}
                className="rounded-lg bg-gray-100 px-3 text-lg"
              >
                🎤
              </button>
            </div>

            {search && !selectedBorrower && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredBorrowers.map((b) => (
                  <div
                    key={b.borrower_id}
                    onClick={() => {
                      setSelectedBorrower(b);
                      setSearch(`${b.first_name} ${b.last_name}`);
                    }}
                    className="px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                  >
                    {b.first_name} {b.last_name}
                  </div>
                ))}
              </div>
            )}

            {selectedBorrower && (
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-sm font-medium text-[#1E3A8A]">
                  {selectedBorrower.first_name} {selectedBorrower.last_name}
                </span>
                <button
                  onClick={() => {
                    setSelectedBorrower(null);
                    setSearch("");
                  }}
                  className="text-xs text-red-500"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Items Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="space-y-2 border border-gray-200 rounded-xl p-3"
              >
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
      price: selectedProduct
        ? String(selectedProduct.product_price)
        : "",
    };

    setItems(updated);
  }}
  className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm"
>
  <option value="">Select product</option>

  {products.map((product: Product) => (
    <option key={product.product_id} value={product.product_name}>
      {product.product_name}
    </option>
  ))}
</select>

{item.product.trim() &&
  !products.some(
    (p: any) =>
      p.product_name.toLowerCase() ===
      item.product.toLowerCase()
  ) && (
    <button
      type="button"
      onClick={() => {
        setNewProductName(item.product);
        setIsProductModalOpen(true);
      }}
      className="w-full rounded-lg border border-dashed border-[#1E3A8A] bg-blue-50 px-3 py-3 text-left text-sm font-medium text-[#1E3A8A] transition hover:bg-blue-100"
    >
      + Add "{item.product}" as new product
    </button>
  )}

                  <button
                    type="button"
                    onClick={addNewItem}
                    className="rounded-lg bg-[#1E3A8A] text-white px-3 py-3 text-lg"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className="w-1/2 rounded-lg border border-gray-300 px-3 py-3 text-sm"
                  />

<input
  type="number"
  min="1"
  placeholder="Price"
  value={item.price}
  readOnly
  className="w-1/2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-3 text-sm"
/>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsProductModalOpen(true)}
              className="w-full rounded-xl border border-dashed border-[#1E3A8A] bg-blue-50 py-3 text-sm font-medium text-[#1E3A8A] transition hover:bg-blue-100"
            >
              + Add New Product
            </button>
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t border-gray-100 p-6 pt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-[#1E3A8A]">
              ₱{items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3">
<button
  onClick={() => {
    resetLoanForm();
    isClose();
  }}
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="w-1/2 rounded-xl bg-[#16A34A] py-3 text-sm text-white"
            >
              Save Loan
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