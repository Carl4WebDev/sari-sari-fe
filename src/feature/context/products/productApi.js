import { apiRequest } from "../../auth/api/httpClient/httpClient";

// GET products
export const getProductsApi = () =>
  apiRequest("/api/products", {
    method: "GET",
  });

// CREATE product
export const createProductApi = (payload) =>
  apiRequest("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// UPDATE product
export const updateProductApi = (productId, payload) =>
  apiRequest(`/api/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// DELETE product
export const deleteProductApi = (productId) =>
  apiRequest(`/api/products/${productId}`, {
    method: "DELETE",
  });

export const getArchivedProductsApi = () =>
  apiRequest("/api/products/archived", {
    method: "GET",
  });

export const archiveProductApi = (productId) =>
  apiRequest(`/api/products/${productId}/archive`, {
    method: "PATCH",
  });

export const reactivateProductApi = (productId) =>
  apiRequest(`/api/products/${productId}/reactivate`, {
    method: "PATCH",
  });
