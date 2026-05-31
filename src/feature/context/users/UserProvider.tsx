import { useState, useCallback, useMemo } from "react";
import { UserContext } from "./UserContext.js";
import {
  loginUser,
  registerUser,
  getProfile,
  updateStoreName as updateStoreNameApi,
  changePassword as changePasswordApi,
  logoutUser,
} from "./userApi.js";
import { clearAllCache } from "../../../shared/utils/offlineCache";

export const UserProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    const res = await loginUser(email, password);

    if (!res?.ok) {
      setError(res?.message || "Login failed");
      setLoading(false);
      return res;
    }

    // store token + user info
    localStorage.setItem("user_token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // Clear stale cache from previous account
    clearAllCache();

    setLoading(false);
    return res;
  }, []);

  // -------------------------
  // REGISTER
  // -------------------------
  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    const res = await registerUser(payload);

    if (!res?.ok) {
      setError(res?.message || "Registration failed");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  }, []);

  // -------------------------
  // LOGOUT
  // -------------------------
  const clearUser = useCallback(() => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user");
    clearAllCache();
    setProfile(null);
    // Best-effort server-side logout (don't await)
    logoutUser().catch(() => {});
  }, []);

  // -------------------------
  // PROFILE
  // -------------------------
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getProfile();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch profile");
      setLoading(false);
      return res;
    }

    setProfile(res.data);
    setLoading(false);
    return res;
  }, []);

  const updateStoreName = useCallback(async (storeName) => {
    setLoading(true);
    setError(null);

    const res = await updateStoreNameApi(storeName);

    if (!res?.ok) {
      setError(res?.message || "Failed to update store name");
      setLoading(false);
      return res;
    }

    // Update localStorage user object
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    stored.store_name = res.data.store_name;
    localStorage.setItem("user", JSON.stringify(stored));

    setProfile((prev) => (prev ? { ...prev, store_name: res.data.store_name } : prev));
    setLoading(false);
    return res;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);

    const res = await changePasswordApi(currentPassword, newPassword);

    if (!res?.ok) {
      setError(res?.message || "Failed to change password");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  }, []);

  const value = useMemo(() => ({
    loading,
    error,
    profile,
    clearError,
    login,
    register,
    clearUser,
    fetchProfile,
    updateStoreName,
    changePassword,
  }), [loading, error, profile, clearError, login, register, clearUser, fetchProfile, updateStoreName, changePassword]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
