import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const getDashboardApi = () =>
  apiRequest("/api/dashboard", {
    method: "GET",
  });
