import { useState, useCallback, useMemo, useRef } from "react";
import { PaymentContext } from "./PaymentContext";
import { createPaymentApi } from "./paymentApi";

export const PaymentProvider = ({ children }) => {
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

  const createPayment = useCallback(async (payload, options = {}) => {
    startLoading();
    setError(null);

    const res = await createPaymentApi(payload, options);

    if (!res?.ok) {
      setError(res?.message || "Failed to create payment");
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
    createPayment,
  }), [loading, error, clearError, createPayment]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
