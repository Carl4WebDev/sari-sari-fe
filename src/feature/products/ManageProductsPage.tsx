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
    <div className="space-y-5 pb-24 relative min-h-full">
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
        product={selectedProduct as any}
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
      <div className="rounded-[2rem] bg-slate-900 p-6 sm:p-7 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t("products.title")}</h1>
              <span className="rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black px-3 py-0.5">
                {products.length} {t("nav.products")}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-semibold">
              {t("products.subtitle")}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isOnline && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 px-4.5 text-white shadow-md shadow-blue-600/25 transition cursor-pointer font-black text-xs sm:text-sm active:scale-95 border border-blue-400/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("products.add_product")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsArchivedOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 py-3 px-4 text-slate-200 shadow-2xs transition cursor-pointer font-black text-xs sm:text-sm active:scale-95"
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
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("products.total_products")}</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{products.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800/80 border border-slate-700/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("products.archived")}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-300 mt-1">{archivedProducts.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-700/60 text-slate-400 border border-slate-600/50 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("products.search")}
            className="w-full rounded-2xl border border-slate-200/90 bg-white py-3.5 pl-12 pr-28 text-xs sm:text-sm font-semibold shadow-2xs outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-slate-900 placeholder:text-slate-400"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs font-black transition cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
            <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/70 hidden sm:inline-block">
              {filteredProducts.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Product List Grid (4-Column Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4.5">
        {loading && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-sm font-bold text-slate-500 text-center shadow-xs flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{t("products.loading")}...</span>
          </div>
        )}

        {!loading &&
          filteredProducts.map((product: Product) => {
            const price = Number(product.product_price ?? product.price ?? 0);
            return (
              <article
                key={product.product_id}
                className="rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:shadow-lg hover:border-blue-400/80 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full space-y-4 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + ID Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-500 border border-slate-200/60">
                      ID: #{product.product_id}
                    </span>
                  </div>

                  {/* Product Name */}
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {product.product_name}
                    </h2>
                  </div>
                </div>

                {/* Bottom Bar: Price + Tactile Buttons */}
                <div className="pt-3.5 border-t border-slate-100/90 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                      {t("products.price")}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                      ₱{price.toLocaleString()}
                    </span>
                  </div>

                  {isOnline && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(product);
                        }}
                        className="rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 px-3 py-1.5 text-xs font-black text-slate-700 transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>{t("products.edit")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(product.product_id);
                        }}
                        disabled={actionLoading}
                        className="rounded-xl border border-rose-200/80 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800 px-3 py-1.5 text-xs font-black text-rose-700 transition flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>{t("products.archive")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

        {!loading && filteredProducts.length === 0 && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs space-y-4">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {t("products.no_products")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-sm mx-auto mt-1">
                {t("products.no_products_hint")}
              </p>
            </div>
            {isOnline && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-2.5 px-4.5 text-white shadow-md text-xs font-black transition cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("products.add_product")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div 
          onClick={() => setConfirmModal({ isOpen: false, productId: null })}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 max-w-sm w-full space-y-4 text-center animate-modal-pop"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-2xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{t("products.confirm_archive")}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">This product will be moved to archived items.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, productId: null })}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer transition active:scale-95"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={confirmArchive}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-black text-white shadow-md transition cursor-pointer active:scale-95"
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