import { apiRequest } from "../../auth/api/httpClient/httpClient";

// GET borrowers of logged user
export const getBorrowersApi = () =>
  apiRequest("/api/borrowers", {
    method: "GET",
  });

// CREATE borrower
export const createBorrowerApi = (payload) =>
  apiRequest("/api/borrowers", {
    method: "POST",
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
