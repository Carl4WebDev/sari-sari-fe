import { useState, useCallback, useMemo } from "react";
import { PaymentContext } from "./PaymentContext";
import { createPaymentApi } from "./paymentApi";

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const createPayment = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    const res = await createPaymentApi(payload);

    if (!res?.ok) {
      setError(res?.message || "Failed to create payment");
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
    createPayment,
  }), [loading, error, clearError, createPayment]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
