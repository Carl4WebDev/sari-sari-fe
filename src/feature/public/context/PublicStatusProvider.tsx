import { useState } from "react";
import { PublicStatusContext } from "./PublicStatusContext";
import { getPublicStatusApi } from "./publicStatusApi";

export const PublicStatusProvider = ({ children }) => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPublicStatus = async (token) => {
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
  };

  const clearStatusData = () => {
    setStatusData(null);
    setError(null);
  };

  return (
    <PublicStatusContext.Provider
      value={{
        statusData,
        loading,
        error,
        getPublicStatus,
        clearStatusData,
      }}
    >
      {children}
    </PublicStatusContext.Provider>
  );
};