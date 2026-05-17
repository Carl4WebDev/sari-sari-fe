import { apiRequest } from "../../auth/api/httpClient/httpClient";

// CREATE PAYMENT
export const createPaymentApi = (payload) =>
  apiRequest("/api/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
