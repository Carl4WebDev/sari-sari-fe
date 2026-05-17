import { useEffect, useState } from "react";
import { useLoan } from "../../context/loans/useLoan";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrowerId: number;
}

export default function AddLoanModalBorrowerDetails({
  isOpen,
  isClose,
  borrowerId,
}: Props) {
  const { createLoan } = useLoan();

  const [animate, setAnimate] = useState(false);

  const [items, setItems] = useState([
    { product: "", quantity: "", price: "" },
  ]);

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
  // Loan items logic
  // -----------------------------

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addNewItem = () => {
    setItems([...items, { product: "", quantity: "", price: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // -----------------------------
  // Save loan
  // -----------------------------

  const handleSubmit = async () => {
    const payload = {
      borrower_id: borrowerId,
      items: items.map((i) => ({
        product_name: i.product,
        quantity: Number(i.quantity),
        price: Number(i.price),
      })),
    };

    const res = await createLoan(payload);

    if (res?.ok) {
      setItems([{ product: "", quantity: "", price: "" }]);
      isClose();
    }
  };

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

          {/* Loan Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="space-y-2 border border-gray-200 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Product"
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(index, "product", e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm"
                  />

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
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    className="w-1/2 rounded-lg border border-gray-300 px-3 py-3 text-sm"
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
              onClick={isClose}
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