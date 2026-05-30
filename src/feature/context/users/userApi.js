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

export const getProfile = () =>
  apiRequest("/api/users/profile", {
    method: "GET",
  });

export const updateStoreName = (store_name) =>
  apiRequest("/api/users/profile/store-name", {
    method: "PATCH",
    body: JSON.stringify({ store_name }),
  });

export const changePassword = (current_password, new_password) =>
  apiRequest("/api/users/profile/password", {
    method: "PATCH",
    body: JSON.stringify({ current_password, new_password }),
  });

export const logoutUser = () =>
  apiRequest("/api/users/logout", {
    method: "POST",
  });
