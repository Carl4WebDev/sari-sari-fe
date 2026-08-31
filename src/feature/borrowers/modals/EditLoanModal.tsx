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
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={isClose}
    >
      <div
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                Edit Loan
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Modify loan items & pricing</p>
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
          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-2 border border-slate-200/90 rounded-3xl p-4 bg-slate-50/40"
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
                  className="flex-1 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition"
                />

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
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                  placeholder="Qty"
                  className="w-1/2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none transition"
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
                  className="w-1/2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none transition"
                />
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-xl px-2.5 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={isClose}
            className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}