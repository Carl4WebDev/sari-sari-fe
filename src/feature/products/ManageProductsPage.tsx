import { useEffect, useMemo, useState } from "react";
import { useProduct } from "../context/products/useProduct";
import ProductModal from "./modals/ProductModal";
import ArchivedProductsModal from "./modals/ArchivedProductsModal";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  created_at?: string;
}

export default function ManageProductsPage() {
const { t } = useTranslation();
const {
  products,
  archivedProducts,
  loading,
  actionLoading,
  fetchProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  fetchArchivedProducts,
  reactivateProduct,
} = useProduct();

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) =>
      product.product_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

const [confirmModal, setConfirmModal] = useState<{
  isOpen: boolean;
  productId: number | null;
}>({ isOpen: false, productId: null });

const handleArchive = async (productId: number) => {
  setConfirmModal({ isOpen: true, productId });
};

const confirmArchive = async () => {
  if (confirmModal.productId) {
    await archiveProduct(confirmModal.productId);
  }
  setConfirmModal({ isOpen: false, productId: null });
};

  return (
    <div className="space-y-5 pb-24">
      <ProductModal
        isOpen={isModalOpen}
        isClose={() => setIsModalOpen(false)}
        mode={modalMode}
        product={selectedProduct}
        loading={actionLoading}
        onSubmit={(payload) => {
          if (modalMode === "add") {
            return createProduct(payload);
          }

          return updateProduct(selectedProduct?.product_id, payload);
        }}
      />

      <ArchivedProductsModal
  isOpen={isArchivedOpen}
  isClose={() => setIsArchivedOpen(false)}
  archivedProducts={archivedProducts}
  loading={loading}
  onFetchArchived={fetchArchivedProducts}
  onReactivate={reactivateProduct}
/>

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Products</h1>

        <p className="mt-1 text-sm text-blue-100">
          Manage products used when adding borrower loans.
        </p>

        <div className="mt-5 rounded-xl bg-white/15 p-3">
          <p className="text-xs text-blue-100">Total Products</p>
          <p className="text-xl font-bold">{products.length}</p>
        </div>
      </div>

{/* Sticky Search */}
<div className="sticky top-0 z-20 px-1 py-2 backdrop-blur-sm">
  <div className="rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-lg">
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        🔍
      </span>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search product..."
        className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
      />
    </div>
  </div>
</div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading && (
          <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
            Loading products...
          </div>
        )}

        {!loading &&
          filteredProducts.map((product: Product) => (
<article
  key={product.product_id}
  className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-[#1E3A8A] hover:shadow-md"
>
  <div className="flex items-center justify-between gap-3">

    {/* Product Info */}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">

        <div className="min-w-0">
          <h2 className=" text-[15px] font-semibold text-gray-900">
            {product.product_name}
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-400">
            Product ID: {product.product_id}
          </p>
        </div>
      </div>
    </div>

    {/* Right Side */}
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wide text-gray-400">
        Price
      </p>

      <p className="text-sm font-bold text-[#1E3A8A]">
        ₱{Number(product.product_price || 0).toLocaleString()}
      </p>

      <div className="mt-2 flex justify-end gap-1">
        <button
onClick={(e) => {
  e.stopPropagation();
  handleOpenEdit(product);
}}          className="rounded-lg border border-[#1E3A8A] px-3 py-2 text-xs font-medium text-[#1E3A8A]"
        >
          Edit
        </button>

        <button
          onClick={(e) => {
  e.stopPropagation();
  handleArchive(product.product_id);
}}
          disabled={actionLoading}
          className="rounded-lg border border-red-600 px-3 py-2 text-xs font-medium text-red-600 disabled:opacity-50"
        >
          archive
        </button>
      </div>
    </div>
  </div>
</article>
          ))}

        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">📦</p>

            <h3 className="mt-3 text-base font-semibold text-gray-800">
              No products found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add products so loan entry becomes faster and standardized.
            </p>

            <button
              onClick={handleOpenAdd}
              className="mt-5 rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white"
            >
              + Add Product
            </button>
          </div>
        )}
      </div>
      {/* Floating Product Footer Actions */}
<div className="fixed bottom-0 left-0 z-30 w-full border-t border-gray-200 bg-white/95 backdrop-blur">
  <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 p-3">

    {/* Add Product */}
    <button
      onClick={handleOpenAdd}
      className="flex flex-col items-center justify-center rounded-xl bg-green-600 py-2 text-white shadow-sm transition hover:bg-green-700"
    >
      <span className="text-lg">＋</span>

      <span className="mt-1 text-[11px] font-medium">
        Add Product
      </span>
    </button>

    {/* Archived */}
    <button
      onClick={() => setIsArchivedOpen(true)}
      className="flex flex-col items-center justify-center rounded-xl border border-[#1E3A8A] py-2 text-[#1E3A8A] shadow-sm transition hover:bg-blue-50"
    >
      <span className="text-lg">📦</span>

      <span className="mt-1 text-[11px] font-medium">
        Archived
      </span>
    </button>
  </div>
</div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-[#1E3A8A]">Archive Product</h2>
            <p className="mt-3 text-sm text-gray-600">Are you sure you want to archive this product?</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, productId: null })}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmArchive}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}