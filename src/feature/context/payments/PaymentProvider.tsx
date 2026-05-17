import { useState } from "react";
import { PaymentContext } from "./PaymentContext";
import { createPaymentApi } from "./paymentApi";

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------
  // CREATE PAYMENT
  // -------------------------

  const createPayment = async (payload) => {
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
  };

  return (
    <PaymentContext.Provider
      value={{
        loading,
        error,
        createPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
