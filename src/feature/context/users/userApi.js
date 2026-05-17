import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const loginUser = (email, password) =>
  apiRequest("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (payload) =>
  apiRequest("/api/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
