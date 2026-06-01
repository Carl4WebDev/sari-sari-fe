import { apiRequest } from "../../auth/api/httpClient/httpClient";

// GET borrowers of logged user (with optional pagination)
export const getBorrowersApi = ({ page, limit } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiRequest(`/api/borrowers${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
};

// CREATE borrower
export const createBorrowerApi = (payload) =>
  apiRequest("/api/borrowers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// UPDATE borrower
export const updateBorrowerApi = (borrowerId, payload) =>
  apiRequest(`/api/borrowers/${borrowerId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// GET borrower transactions
export const getBorrowerTransactionsApi = (borrowerId) =>
  apiRequest(`/api/borrowers/${borrowerId}/transactions`, {
    method: "GET",
  });

// UPLOAD borrower profile image
export const uploadBorrowerProfileImageApi = (borrowerId, formData) =>
  apiRequest(`/api/borrowers/${borrowerId}/profile-image`, {
    method: "PATCH",
    body: formData,
  });

// export const updateBorrowerPublicAccessApi = (borrowerId, enabled) =>
//   apiRequest(`/api/borrowers/${borrowerId}/public-access`, {
//     method: "PATCH",
//     body: JSON.stringify({ enabled }),
//   });

export const updatePublicLoanAccessApi = (borrowerId, enabled) =>
  apiRequest(`/api/borrowers/${borrowerId}/public-access`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });

export const archiveBorrowerApi = (borrowerId) =>
  apiRequest(`/api/borrowers/${borrowerId}/archive`, {
    method: "PATCH",
  });

export const getArchivedBorrowersApi = () =>
  apiRequest("/api/borrowers/archived", {
    method: "GET",
  });

export const reactivateBorrowerApi = (borrowerId) =>
  apiRequest(`/api/borrowers/${borrowerId}/reactivate`, {
    method: "PATCH",
  });

export const getBorrowerNotesApi = (borrowerId) =>
  apiRequest(`/api/borrowers/${borrowerId}/notes`, {
    method: "GET",
  });

export const createBorrowerNoteApi = (borrowerId, payload) =>
  apiRequest(`/api/borrowers/${borrowerId}/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateBorrowerNoteApi = (borrowerId, noteId, payload) =>
  apiRequest(`/api/borrowers/${borrowerId}/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteBorrowerNoteApi = (borrowerId, noteId) =>
  apiRequest(`/api/borrowers/${borrowerId}/notes/${noteId}`, {
    method: "DELETE",
  });

// VOID transaction
export const voidTransactionApi = (borrowerId, transactionId, reason) =>
  apiRequest(`/api/borrowers/${borrowerId}/transactions/${transactionId}/void`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
