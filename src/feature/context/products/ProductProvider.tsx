import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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

  const loadingCount = useRef(0);

  const startLoading = useCallback(() => {
    loadingCount.current++;
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    loadingCount.current--;
    if (loadingCount.current <= 0) {
      loadingCount.current = 0;
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const fetchProducts = useCallback(async (signal) => {
    startLoading();
    setError(null);
    try {
      const res = await getProductsApi({ signal });

      if (signal?.aborted) return res;
      if (!res?.ok) {
        setError(res?.message || "Failed to fetch products");
        return res;
      }

      setProducts((prev) => {
        const fresh = Array.isArray(res.data) ? res.data : [];
        const pending = prev.filter((p) => p._pending);
        const freshIds = new Set(fresh.map((p) => p.product_id));
        const remaining = pending.filter((p) => !freshIds.has(p.product_id));
        return [...remaining, ...fresh];
      });
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // Fetch products on mount with AbortController
  useEffect(() => {
    if (!localStorage.getItem("user_token")) return;
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchArchivedProducts = useCallback(async () => {
    startLoading();
    setError(null);
    try {
      const res = await getArchivedProductsApi();

      if (!res?.ok) {
        setError(res?.message || "Failed to fetch archived products");
        return res;
      }

      setArchivedProducts(Array.isArray(res.data) ? res.data : []);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const archiveProduct = useCallback(async (productId) => {
    startLoading();
    setError(null);
    try {
      const res = await archiveProductApi(productId);

      if (!res?.ok) {
        setError(res?.message || "Failed to archive product");
        return res;
      }

      await fetchProducts();
      await fetchArchivedProducts();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, fetchProducts, fetchArchivedProducts]);

  const reactivateProduct = useCallback(async (productId) => {
    startLoading();
    setError(null);
    try {
      const res = await reactivateProductApi(productId);

      if (!res?.ok) {
        setError(res?.message || "Failed to reactivate product");
        return res;
      }

      await fetchProducts();
      await fetchArchivedProducts();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, fetchProducts, fetchArchivedProducts]);

  const createProduct = useCallback(async (payload) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await createProductApi(payload);

      if (!res?.ok) {
        setError(res?.message || "Failed to create product");
        return res;
      }

      if (res.queued) {
        const tempProduct = {
          ...payload,
          product_id: Date.now(),
          _pending: true,
          created_at: new Date().toISOString(),
        };
        setProducts((prev) => [tempProduct, ...prev]);
      } else {
        await fetchProducts();
      }
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setActionLoading(false);
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (productId, payload) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await updateProductApi(productId, payload);

      if (!res?.ok) {
        setError(res?.message || "Failed to update product");
        return res;
      }

      await fetchProducts();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setActionLoading(false);
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await deleteProductApi(productId);

      if (!res?.ok) {
        setError(res?.message || "Failed to delete product");
        return res;
      }

      await fetchProducts();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      return { ok: false, message: "Unexpected error" };
    } finally {
      setActionLoading(false);
    }
  }, [fetchProducts]);

  const value = useMemo(() => ({
    products,
    loading,
    actionLoading,
    error,
    clearError,
    archivedProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchArchivedProducts,
    archiveProduct,
    reactivateProduct,
  }), [
    products, loading, actionLoading, error, clearError, archivedProducts,
    fetchProducts, createProduct, updateProduct, deleteProduct,
    fetchArchivedProducts, archiveProduct, reactivateProduct,
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
