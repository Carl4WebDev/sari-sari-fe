import { useState, useCallback, useMemo } from "react";
import { PublicStatusContext } from "./PublicStatusContext";
import { getPublicStatusApi } from "./publicStatusApi";

export const PublicStatusProvider = ({ children }) => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPublicStatus = useCallback(async (token) => {
    setLoading(true);
    setError(null);

    const res = await getPublicStatusApi(token);

    if (!res?.ok) {
      setError(res?.message || "Status page not found");
      setLoading(false);
      return res;
    }

    setStatusData(res.data);
    setLoading(false);
    return res;
  }, []);

  const clearStatusData = useCallback(() => {
    setStatusData(null);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    statusData,
    loading,
    error,
    getPublicStatus,
    clearStatusData,
  }), [statusData, loading, error, getPublicStatus, clearStatusData]);

  return (
    <PublicStatusContext.Provider value={value}>
      {children}
    </PublicStatusContext.Provider>
  );
};