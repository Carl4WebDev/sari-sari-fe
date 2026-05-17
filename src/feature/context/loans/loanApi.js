import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const createLoanApi = (payload) =>
  apiRequest("/api/loans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
