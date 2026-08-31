import { useEffect, useMemo, useState } from "react";
import { useProduct } from "../context/products/useProduct";
import ProductModal from "./modals/ProductModal";
import ArchivedProductsModal from "./modals/ArchivedProductsModal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useOnlineStatus } from "../../shared/hooks/useOnlineStatus";

interface Product {
  product_id: number;
  product_name: string;
  product_price?: number;
  price?: number;
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
    <div className="space-y-4 pb-24 relative min-h-full">
      {!isOnline && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-center gap-2 font-semibold shadow-xs">
          <svg className="w-4 h-4 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Offline Mode — viewing cached products.</span>
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

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t("products.title")}</h1>
              <span className="rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs font-extrabold px-3 py-0.5">
                {products.length} {t("nav.products")}
              </span>
            </div>
            <p className="mt-1 text-xs md:text-sm text-slate-400 font-medium">
              {t("products.subtitle")}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isOnline && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-4 text-white shadow-md transition cursor-pointer font-black text-xs sm:text-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("products.add_product")}</span>
              </button>
            )}

            <button
              onClick={() => setIsArchivedOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 py-2.5 px-3.5 text-slate-200 shadow-2xs transition cursor-pointer font-extrabold text-xs sm:text-sm active:scale-95"
              title="View Archived Products"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>{t("products.archived")}</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 relative z-10 max-w-md">
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("products.total_products")}</p>
            <p className="text-2xl md:text-3xl font-black text-blue-400 mt-1">{products.length}</p>
          </div>

          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("products.archived")}</p>
            <p className="text-2xl md:text-3xl font-black text-slate-400 mt-1">{archivedProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Sticky Search */}
      <div className="sticky top-0 z-20 pt-1">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("products.search")}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-xs sm:text-sm font-semibold shadow-xs outline-none focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Product List Grid (4-Column Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500 text-center shadow-xs">
            {t("products.loading")}
          </div>
        )}

        {!loading &&
          filteredProducts.map((product: Product) => {
            const price = Number(product.product_price ?? product.price ?? 0);
            return (
              <article
                key={product.product_id}
                className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-blue-500 hover:shadow-md flex flex-col justify-between h-full space-y-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="truncate text-sm font-black text-slate-900">
                    {product.product_name}
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    ID: #{product.product_id}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">{t("products.price")}</span>
                    <span className="text-base font-black text-blue-950">₱{price.toLocaleString()}</span>
                  </div>

                  {isOnline && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(product);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:text-blue-700 transition cursor-pointer"
                      >
                        {t("products.edit")}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(product.product_id);
                        }}
                        disabled={actionLoading}
                        className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-rose-700 transition disabled:opacity-50 cursor-pointer"
                      >
                        {t("products.archive")}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

        {!loading && filteredProducts.length === 0 && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xs space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {t("products.no_products")}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              {t("products.no_products_hint")}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{t("products.confirm_archive")}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">This product will be moved to archived items.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, productId: null })}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmArchive}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-extrabold text-white shadow-xs cursor-pointer"
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