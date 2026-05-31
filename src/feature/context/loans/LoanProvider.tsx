import { useState, useCallback, useMemo } from "react";
import { LoanContext } from "./LoanContext";
import { createLoanApi } from "./loanApi";

export const LoanProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const createLoan = useCallback(async (payload, options = {}) => {
    setLoading(true);
    setError(null);

    const res = await createLoanApi(payload, options);

    if (!res?.ok) {
      setError(res?.message || "Failed to create loan");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  }, []);

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