import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const createExpenseApi = (payload) =>
  apiRequest("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getExpensesApi = (month, year) => {
  const params = new URLSearchParams();
  if (month) params.set("month", String(month));
  if (year) params.set("year", String(year));
  const qs = params.toString();
  return apiRequest(`/api/expenses${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
};

export const updateExpenseApi = (id, payload) =>
  apiRequest(`/api/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteExpenseApi = (id) =>
  apiRequest(`/api/expenses/${id}`, {
    method: "DELETE",
  });
