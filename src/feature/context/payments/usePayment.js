import { useContext } from "react";
import { PaymentContext } from "./PaymentContext";

export const usePayment = () => {
  const ctx = useContext(PaymentContext);

  if (!ctx) {
    throw new Error("usePayment must be used inside PaymentProvider");
  }

  return ctx;
};
