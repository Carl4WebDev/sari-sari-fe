import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const getPublicStatusApi = (token) =>
  apiRequest(`/api/public/status/${token}`, {
    method: "GET",
  });
