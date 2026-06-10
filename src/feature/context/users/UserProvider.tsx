import { useState, useCallback, useMemo, useRef } from "react";
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
import { clearQueue } from "../../../shared/utils/offlineQueue";

export const UserProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const loadingCount = useRef(0);

  const startLoading = useCallback(() => {
    loadingCount.current++;
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    loadingCount.current--;
    if (loadingCount.current <= 0) {
      loadingCount.current = 0;
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email, password) => {
    startLoading();
    setError(null);

    const res = await loginUser(email, password);

    if (!res?.ok) {
      setError(res?.message || "Login failed");
      stopLoading();
      return res;
    }

    localStorage.setItem("user_token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    clearAllCache();
    clearQueue();

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const register = useCallback(async (payload) => {
    startLoading();
    setError(null);

    const res = await registerUser(payload);

    if (!res?.ok) {
      setError(res?.message || "Registration failed");
      stopLoading();
      return res;
    }

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const clearUser = useCallback(() => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user");
    clearAllCache();
    clearQueue();
    setProfile(null);
    logoutUser().catch(() => {});
  }, []);

  const fetchProfile = useCallback(async () => {
    startLoading();
    setError(null);

    const res = await getProfile();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch profile");
      stopLoading();
      return res;
    }

    setProfile(res.data);
    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const updateStoreName = useCallback(async (storeName) => {
    startLoading();
    setError(null);

    const res = await updateStoreNameApi(storeName);

    if (!res?.ok) {
      setError(res?.message || "Failed to update store name");
      stopLoading();
      return res;
    }

    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    stored.store_name = res.data.store_name;
    localStorage.setItem("user", JSON.stringify(stored));

    setProfile((prev) => (prev ? { ...prev, store_name: res.data.store_name } : prev));
    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    startLoading();
    setError(null);

    const res = await changePasswordApi(currentPassword, newPassword);

    if (!res?.ok) {
      setError(res?.message || "Failed to change password");
      stopLoading();
      return res;
    }

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

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
