import { useState, useCallback, useMemo, useRef } from "react";
import { LoanContext } from "./LoanContext";
import { createLoanApi } from "./loanApi";

export const LoanProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const createLoan = useCallback(async (payload, options = {}) => {
    startLoading();
    setError(null);

    const res = await createLoanApi(payload, options);

    if (!res?.ok) {
      setError(res?.message || "Failed to create loan");
      stopLoading();
      return res;
    }

    stopLoading();
    return res;
  }, [startLoading, stopLoading]);

  const value = useMemo(() => ({
    loading,
    error,
    clearError,
    createLoan,
  }), [loading, error, clearError, createLoan]);

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};
