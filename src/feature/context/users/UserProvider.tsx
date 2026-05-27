import { useState, useCallback, useMemo } from "react";
import { UserContext } from "./UserContext.js";
import {
  loginUser,
  registerUser,
} from "./userApi.js";

export const UserProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    // store token + user
    localStorage.setItem("user_token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

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
  }, []);

  const value = useMemo(() => ({
    loading,
    error,
    clearError,
    login,
    register,
    clearUser,
  }), [loading, error, clearError, login, register, clearUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
