import { useState, useCallback, useMemo, type ReactNode } from "react";
import { UserContext, type UserProfile } from "./UserContext";
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

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const clearError = useCallback(() => setError(null), []);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const res = await loginUser(email, password);

    if (!res?.ok) {
      const errMsg = res?.message || "Login failed";
      setError(errMsg);
      setLoading(false);
      return res;
    }

    // Clear demo mode flag and save real user credentials
    localStorage.removeItem("is_demo_mode");
    if (res.data?.token) {
      localStorage.setItem("user_token", res.data.token);
    }
    if (res.data?.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setProfile(res.data.user);
    }

    // Clear stale cache and queue from previous session
    clearAllCache();
    clearQueue();

    setLoading(false);
    return res;
  }, []);

  // -------------------------
  // REGISTER
  // -------------------------
  const register = useCallback(async (payload: { email: string; store_name: string; password: string }) => {
    setLoading(true);
    setError(null);

    const res = await registerUser(payload);

    if (!res?.ok) {
      const errMsg = res?.message || "Registration failed";
      setError(errMsg);
      setLoading(false);
      return res;
    }

    // Auto-login upon successful registration
    const loginRes = await loginUser(payload.email, payload.password);
    if (loginRes?.ok) {
      localStorage.removeItem("is_demo_mode");
      if (loginRes.data?.token) {
        localStorage.setItem("user_token", loginRes.data.token);
      }
      if (loginRes.data?.user) {
        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        setProfile(loginRes.data.user);
      }
      clearAllCache();
      clearQueue();
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
    localStorage.removeItem("is_demo_mode");
    clearAllCache();
    clearQueue();
    setProfile(null);
    // Best-effort server-side logout
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

    if (res.data) {
      setProfile(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    }
    setLoading(false);
    return res;
  }, []);

  const updateStoreName = useCallback(async (storeName: string) => {
    setLoading(true);
    setError(null);

    const res = await updateStoreNameApi(storeName);

    if (!res?.ok) {
      setError(res?.message || "Failed to update store name");
      setLoading(false);
      return res;
    }

    // Update localStorage user object
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.store_name = res.data?.store_name || storeName;
      localStorage.setItem("user", JSON.stringify(stored));
    } catch {
      // ignore
    }

    setProfile((prev) => (prev ? { ...prev, store_name: res.data?.store_name || storeName } : prev));
    setLoading(false);
    return res;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
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
