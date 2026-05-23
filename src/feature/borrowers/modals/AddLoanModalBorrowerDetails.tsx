import { useEffect, useState } from "react";
import { useLoan } from "../../context/loans/useLoan";

import { useProduct } from "../../context/products/useProduct";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  borrowerId: number;
  borrowerName: string;
  profileImageUrl?: string;
  onLoanCreated?: () => Promise<void> | void;
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
const { createLoan } = useLoan();
const { products, fetchProducts } = useProduct();

  const [animate, setAnimate] = useState(false);

const [items, setItems] = useState([
  { product: "", quantity: "1", price: "" },
]);

  // -----------------------------
  // Modal animation
  // -----------------------------

useEffect(() => {
  if (isOpen) {
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
  { product: "", quantity: "1", price: "" },
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
  await onLoanCreated?.();
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
          <div className="rounded-xl bg-gray-50 p-4 text-center">
  <div className="flex justify-center">
    <img
      src={
        profileImageUrl ||
        "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(borrowerName || "Borrower")
      }
      alt={borrowerName || "Borrower"}
      className="h-16 w-16 rounded-full border border-gray-200 object-cover"
    />
  </div>

  <p className="mt-3 text-sm font-semibold text-gray-800">
    {borrowerName}
  </p>

  <p className="text-xs text-gray-500">Selected borrower</p>
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
    <option
      key={product.product_id}
      value={product.product_name}
    >
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
                    min="1"
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