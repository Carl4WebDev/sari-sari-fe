import { useEffect, useMemo, useState } from "react";
import { useProduct } from "../context/products/useProduct";
import ProductModal from "./modals/ProductModal";
import ArchivedProductsModal from "./modals/ArchivedProductsModal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { generateProductsPDF } from "../../shared/utils/exportToPDF";
import { useOnlineStatus } from "../../shared/hooks/useOnlineStatus";

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  created_at?: string;
}

export default function ManageProductsPage() {
const { t } = useTranslation();
const isOnline = useOnlineStatus();
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

{!isOnline && (
  <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
    <span>📡</span>
    <span>Offline — viewing cached products. Adding, editing, and archiving require an internet connection.</span>
  </div>
)}

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
        <h1 className="text-2xl font-bold">{t("products.title")}</h1>

        <p className="mt-1 text-sm text-blue-100">
          {t("products.subtitle")}
        </p>

        <div className="mt-5 rounded-xl bg-white/15 p-3">
          <p className="text-xs text-blue-100">{t("products.total_products")}</p>
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
        placeholder={t("products.search")}
        className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
      />
    </div>
  </div>
</div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading && (
          <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
            {t("products.loading")}
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
        {t("products.price")}
      </p>

      <p className="text-sm font-bold text-[#1E3A8A]">
        ₱{Number(product.product_price || 0).toLocaleString()}
      </p>

      {isOnline && (
      <div className="mt-2 flex justify-end gap-1">
        <button
onClick={(e) => {
  e.stopPropagation();
  handleOpenEdit(product);
}}          className="rounded-lg border border-[#1E3A8A] px-3 py-2 text-xs font-medium text-[#1E3A8A]"
        >
          {t("products.edit")}
        </button>

        <button
          onClick={(e) => {
  e.stopPropagation();
  handleArchive(product.product_id);
}}
          disabled={actionLoading}
          className="rounded-lg border border-red-600 px-3 py-2 text-xs font-medium text-red-600 disabled:opacity-50"
        >
          {t("products.archive")}
        </button>
      </div>
      )}
    </div>
  </div>
</article>
          ))}

        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">📦</p>

            <h3 className="mt-3 text-base font-semibold text-gray-800">
              {t("products.no_products")}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {t("products.no_products_hint")}
            </p>

            {isOnline && (
              <button
                onClick={handleOpenAdd}
                className="mt-5 rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white"
              >
                + {t("products.add_product")}
              </button>
            )}
          </div>
        )}
      </div>
      {/* Floating Product Footer Actions */}
<div className="fixed bottom-0 left-0 z-30 w-full border-t border-gray-200 bg-white/95 backdrop-blur">
  <div className="mx-auto grid max-w-2xl grid-cols-3 gap-2 p-3">

    {/* Add Product — hidden offline */}
    {isOnline && (
    <button
      onClick={handleOpenAdd}
      className="flex flex-col items-center justify-center rounded-xl bg-green-600 py-2 text-white shadow-sm transition hover:bg-green-700"
    >
      <span className="text-lg">＋</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("products.add_product")}
      </span>
    </button>
    )}

    {/* Archived */}
    <button
      onClick={() => setIsArchivedOpen(true)}
      className="flex flex-col items-center justify-center rounded-xl border border-[#1E3A8A] py-2 text-[#1E3A8A] shadow-sm transition hover:bg-blue-50"
    >
      <span className="text-lg">📦</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("products.archived")}
      </span>
    </button>

    {/* Export PDF */}
    <button
      onClick={() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        generateProductsPDF(filteredProducts, user.store_name || "");
      }}
      className="flex flex-col items-center justify-center rounded-xl bg-[#DC2626] py-2 text-white shadow-sm transition hover:bg-[#B91C1C]"
    >
      <span className="text-lg">📕</span>

      <span className="mt-1 text-[11px] font-medium">
        {t("common.export_pdf")}
      </span>
    </button>
  </div>
</div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-[#1E3A8A]">{t("products.archive")}</h2>
            <p className="mt-3 text-sm text-gray-600">{t("products.confirm_archive")}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, productId: null })}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmArchive}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white"
              >
                {t("products.archive")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}