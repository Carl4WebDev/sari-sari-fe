import { useState } from "react";
import { DashboardContext } from "./DashboardContext";
import { getDashboardApi } from "./dashboardApi";

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    const res = await getDashboardApi();

    if (!res?.ok) {
      setError(res?.message || "Failed to fetch dashboard");
      setLoading(false);
      return res;
    }

    setDashboard(res.data);
    setLoading(false);
    return res;
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboard,
        loading,
        error,
        clearError,
        fetchDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};