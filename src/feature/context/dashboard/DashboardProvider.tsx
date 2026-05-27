import { useState, useCallback, useMemo } from "react";
import { DashboardContext } from "./DashboardContext";
import { getDashboardApi } from "./dashboardApi";

export const DashboardProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchDashboard = useCallback(async () => {
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
  }, []);

  const value = useMemo(() => ({
    dashboard,
    loading,
    error,
    clearError,
    fetchDashboard,
  }), [dashboard, loading, error, clearError, fetchDashboard]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
