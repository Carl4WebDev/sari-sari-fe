import { useState } from "react";
import { UserContext } from "./UserContext.js";
import {
  loginUser,
  registerUser,
} from "./userApi.js";

export const UserProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (email, password) => {
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
  };

  // -------------------------
  // REGISTER
  // -------------------------
  const register = async (payload) => {
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
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const clearUser = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user");
    setUserInfo(null);
  };

  return (
    <UserContext.Provider
      value={{
        loading,
        error,

        // auth
        login,
        register,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
