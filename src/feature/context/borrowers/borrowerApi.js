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
