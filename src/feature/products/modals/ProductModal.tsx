import { useEffect, useState } from "react";

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
  onSubmit,
}: Props) {
  const [animate, setAnimate] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    price: "",
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
          product_name: "",
          price: "",
        });
      }
    } else {
      setAnimate(false);
    }
  }, [isOpen, mode, product]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSubmit = async () => {
  if (!form.product_name.trim()) {
    alert("Product name is required");
    return;
  }

  if (!form.price || Number(form.price) <= 0) {
    alert("Valid price is required");
    return;
  }

  const res = await onSubmit({
    product_name: form.product_name.trim(),
    product_price: Number(form.price),
  });

  if (res?.ok) {
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
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Product Name
              </label>

              <input
                value={form.product_name}
                onChange={(e) => handleChange("product_name", e.target.value)}
                placeholder="Example: Sardines"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Price
              </label>

              <input
                type="number"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Example: 25"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={isClose}
              disabled={loading}
              className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 rounded-xl bg-[#16A34A] py-3 text-sm text-white disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Save Product"
                : "Update Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}