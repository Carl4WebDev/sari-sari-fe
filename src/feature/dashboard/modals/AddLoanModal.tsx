import { useEffect, useState } from "react";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { useLoan } from "../../context/loans/useLoan";
import { useProduct } from "../../context/products/useProduct";

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
}

export default function AddLoanModal({
  isOpen,
  isClose,
  onLoanCreated,
}: Props) {

  const { borrowers, fetchBorrowers } = useBorrower();
  const { createLoan } = useLoan();
  const { products, fetchProducts } = useProduct();

  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

const [items, setItems] = useState([
  { product: "", quantity: "1", price: "" },
]);

const resetLoanForm = () => {
  setSearch("");
  setSelectedBorrower(null);
  setItems([{ product: "", quantity: "1", price: "" }]);

  localStorage.removeItem("active_borrower_id");
};

  // -----------------------------
  // Load borrowers
  // -----------------------------

  useEffect(() => {
    if (!isOpen) return;

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
  { product: "", quantity: "1", price: "" },
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

  const handleSubmit = async () => {

    if (!selectedBorrower) return;

    const payload = {
      borrower_id: selectedBorrower.borrower_id,
      items: items.map((i) => ({
        product_name: i.product,
        quantity: Number(i.quantity),
        price: Number(i.price),
      })),
    };

    const res = await createLoan(payload);

if (res?.ok) {
  await onLoanCreated?.();

  resetLoanForm();
  isClose();
}
  }
  

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
      <div
        className={`fixed top-0 left-0 w-full bg-white rounded-b-2xl shadow-xl transform transition-transform duration-300 ease-out ${
          animate ? "translate-y-0" : "-translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Add Loan
          </h2>

          {/* Borrower Search */}
          <div className="space-y-2">
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

            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredBorrowers.map((b) => (
                <div
                  key={b.borrower_id}
                  onClick={() => setSelectedBorrower(b)}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
                    selectedBorrower?.borrower_id === b.borrower_id
                      ? "bg-[#1E3A8A] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {b.first_name} {b.last_name}
                </div>
              ))}
            </div>
          </div>

          {/* Loan Items */}
          <div className="space-y-4">
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
      </div>
    </div>
  );
}