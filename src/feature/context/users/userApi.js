import { apiRequest } from "../../auth/api/httpClient/httpClient";

export const loginUser = async (email, password) => {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '').replace(/\/api$/, '');
  try {
    const response = await fetch(`${base}/api/users/login`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email,password}),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) return {ok:false,message:json.message || 'Unable to sign in.'};
    if (!json.data?.token || !json.data?.user) return {ok:false,message:'Invalid login response. Please try again.'};
    return {ok:true,data:json.data};
  } catch {return {ok:false,message:'Cannot connect to the server. Please try again.'};}
};

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
