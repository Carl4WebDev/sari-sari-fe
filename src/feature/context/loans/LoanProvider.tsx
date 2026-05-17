import { useState } from "react";
import { LoanContext } from "./LoanContext";
import { createLoanApi } from "./loanApi";

export const LoanProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------
  // CREATE LOAN
  // -------------------------
  const createLoan = async (payload) => {
    setLoading(true);
    setError(null);

    const res = await createLoanApi(payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to create loan");
      setLoading(false);
      return res;
    }

    setLoading(false);
    return res;
  };

  return (
    <LoanContext.Provider
      value={{
        loading,
        error,
        createLoan,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};