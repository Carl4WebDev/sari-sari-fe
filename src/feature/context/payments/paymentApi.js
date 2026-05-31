import { apiRequest } from "../../auth/api/httpClient/httpClient";

// CREATE PAYMENT
export const createPaymentApi = (payload, options = {}) =>
  apiRequest("/api/payments", {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
