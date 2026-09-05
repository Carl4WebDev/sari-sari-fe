import { useContext } from "react";
import { SubscriptionContext, type SubscriptionContextType } from "./SubscriptionContext";

export const useSubscription = (): SubscriptionContextType => {
  const ctx = useContext(SubscriptionContext);

  if (!ctx) {
    throw new Error("useSubscription must be used inside SubscriptionProvider");
  }

  return ctx;
};

export default useSubscription;
