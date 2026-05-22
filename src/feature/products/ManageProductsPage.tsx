import { useEffect, useMemo, useState } from "react";
import { useProduct } from "../context/products/useProduct";
import ProductModal from "./modals/ProductModal";
import ArchivedProductsModal from "./modals/ArchivedProductsModal";

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  created_at?: string;
}

export default function ManageProductsPage() {
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

const handleArchive = async (productId: number) => {
  const confirmArchive = confirm("Archive this product?");

  if (!confirmArchive) return;

  await archiveProduct(productId);
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

      {/* Search + Add */}
      <div className="sticky top-0 z-10 rounded-2xl border bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
            />
          </div>
                    <button
            onClick={handleOpenAdd}
            className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172f70]"
          >
            + Add Product
          </button>

          <button
  onClick={() => setIsArchivedOpen(true)}
  className="rounded-xl border border-[#1E3A8A] px-5 py-3 text-sm font-semibold text-[#1E3A8A] shadow-sm transition hover:bg-blue-50"
>
  Archived
</button>

        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {loading && (
          <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
            Loading products...
          </div>
        )}

        {!loading &&
          filteredProducts.map((product: Product) => (
            <article
              key={product.product_id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {product.product_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Product ID: {product.product_id}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <p className="text-xl font-bold text-[#1E3A8A]">
₱{Number(product.product_price || 0).toLocaleString()}                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="rounded-lg border border-[#1E3A8A] px-4 py-2 text-sm font-medium text-[#1E3A8A]"
                    >
                      Edit
                    </button>

                    <button
onClick={() => handleArchive(product.product_id)}                      disabled={actionLoading}
                      className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
                    >
                      Delete
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
    </div>
  );
}