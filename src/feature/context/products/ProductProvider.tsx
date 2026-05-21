import { useState } from "react";
import { ProductContext } from "./ProductContext";

import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
    getArchivedProductsApi,
  archiveProductApi,
  reactivateProductApi,
} from "./productApi";

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [archivedProducts, setArchivedProducts] = useState([]);

const fetchArchivedProducts = async () => {
  setLoading(true);
  setError(null);

  const res = await getArchivedProductsApi();

  if (!res?.ok) {
    setError(res?.message || "Failed to fetch archived products");
    setLoading(false);
    return res;
  }

  setArchivedProducts(res.data);
  setLoading(false);
  return res;
};

const archiveProduct = async (productId) => {
  setLoading(true);
  setError(null);

  const res = await archiveProductApi(productId);

  if (!res?.ok) {
    setError(res?.message || "Failed to archive product");
    setLoading(false);
    return res;
  }

  await fetchProducts();
  await fetchArchivedProducts();

  setLoading(false);
  return res;
};

const reactivateProduct = async (productId) => {
  setLoading(true);
  setError(null);

  const res = await reactivateProductApi(productId);

  if (!res?.ok) {
    setError(res?.message || "Failed to reactivate product");
    setLoading(false);
    return res;
  }

  await fetchProducts();
  await fetchArchivedProducts();

  setLoading(false);
  return res;
};

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const res = await getProductsApi();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch products");
      setLoading(false);
      return res;
    }

    setProducts(res.data || []);
    setLoading(false);
    return res;
  };

  const createProduct = async (payload) => {
    setActionLoading(true);
    setError(null);

    const res = await createProductApi(payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to create product");
      setActionLoading(false);
      return res;
    }

    await fetchProducts();
    setActionLoading(false);
    return res;
  };

  const updateProduct = async (productId, payload) => {
    setActionLoading(true);
    setError(null);

    const res = await updateProductApi(productId, payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to update product");
      setActionLoading(false);
      return res;
    }

    await fetchProducts();
    setActionLoading(false);
    return res;
  };

  const deleteProduct = async (productId) => {
    setActionLoading(true);
    setError(null);

    const res = await deleteProductApi(productId);

    if (!res?.ok) {
      setError(res?.message || "Failed to delete product");
      setActionLoading(false);
      return res;
    }

    await fetchProducts();
    setActionLoading(false);
    return res;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        actionLoading,
        error,
            archivedProducts,

        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,

            fetchArchivedProducts,
    archiveProduct,
    reactivateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};