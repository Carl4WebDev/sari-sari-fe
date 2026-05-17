import { useEffect, useState } from "react";

interface LoanItem {
  product: string;
  quantity: number;
  price: number;
}

interface Loan {
  id: number;
  borrowerId: number;
  items: LoanItem[];
}

interface Props {
  isOpen: boolean;
  isClose: () => void;
  loan: Loan | null;
}

export default function EditLoanModal({
  isOpen,
  isClose,
  loan,
}: Props) {
  const [animate, setAnimate] = useState(false);
  const [items, setItems] = useState<LoanItem[]>([]);

  // Pre-fill when loan changes
  useEffect(() => {
    if (loan) {
      setItems(loan.items);
    }
  }, [loan]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen || !loan) return null;

  const handleItemChange = (
    index: number,
    field: keyof LoanItem,
    value: string
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]:
        field === "quantity" || field === "price"
          ? Number(value)
          : value,
    };
    setItems(updated);
  };

  const addNewItem = () => {
    setItems([
      ...items,
      { product: "", quantity: 0, price: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const payload = {
      loanId: loan.id,
      items,
    };

    console.log("EDIT LOAN PAYLOAD:", payload);

    // 🔥 Replace with API call
    // await loanApi.update(payload)

    isClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
      <div
        className={`
          fixed top-0 left-0 w-full bg-white
          rounded-b-2xl shadow-xl
          transform transition-transform duration-300 ease-out
          ${animate ? "translate-y-0" : "-translate-y-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Edit Loan
          </h2>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="space-y-2 border border-gray-200 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "product",
                        e.target.value
                      )
                    }
                    placeholder="Product"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
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
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    placeholder="Qty"
                    className="w-1/2 rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                  />

                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        e.target.value
                      )
                    }
                    placeholder="Price"
                    className="w-1/2 rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
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
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="w-1/2 rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}