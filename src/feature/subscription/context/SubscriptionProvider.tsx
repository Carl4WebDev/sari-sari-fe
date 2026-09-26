import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import {
  SubscriptionContext,
  type SubscriptionData,
  type SubscriptionLimits,
} from "./SubscriptionContext";
import { getCurrentSubscriptionApi } from "../api/subscriptionApi";

const DEFAULT_FREE_LIMITS: SubscriptionLimits = {
  id: "free",
  name: "FREE",
  monthlyPrice: 0,
  maxBorrowers: 999999,
  allowSms: false,
  allowCustomPdf: false,
  allowCsvExport: false,
  allowCloudSync: false,
};

const DEFAULT_FREE_SUBSCRIPTION: SubscriptionData = {
  plan: "FREE",
  status: "active",
  is_free: true,
  limits: DEFAULT_FREE_LIMITS,
};

interface Props {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: Props) => {
  const [subscription, setSubscription] = useState<SubscriptionData>(() => {
    try {
      const saved = localStorage.getItem("user_subscription_data");
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_FREE_SUBSCRIPTION;
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchSubscription = useCallback(async () => {
    const token = localStorage.getItem("user_token");
    const isDemo = localStorage.getItem("is_demo_mode") === "true";

    if (!token || isDemo) {
      const demoSub: SubscriptionData = {
        plan: "FREE",
        status: "active",
        is_free: true,
        limits: DEFAULT_FREE_LIMITS,
      };
      setSubscription(demoSub);
      return { ok: true, data: demoSub };
    }

    setLoading(true);
    setError(null);

    const res = await getCurrentSubscriptionApi();

    if (res?.ok && res.data) {
      setSubscription(res.data);
      localStorage.setItem("user_subscription_data", JSON.stringify(res.data));
      if (res.data.plan) {
        localStorage.setItem("user_subscription_plan", res.data.plan.toLowerCase());
      }
    } else if (!res?.ok && res?.message) {
      setError(res.message);
    }

    setLoading(false);
    return res;
  }, []);

  const isFeatureAllowed = useCallback(
    (feature: keyof SubscriptionLimits): boolean => {
      if (!subscription || !subscription.limits) return false;
      return Boolean(subscription.limits[feature]);
    },
    [subscription]
  );

  const canAddBorrower = useCallback(
    (_currentBorrowerCount: number): boolean => {
      // Both FREE and PREMIUM allow unlimited borrowers
      return true;
    },
    []
  );

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const value = useMemo(
    () => ({
      subscription,
      loading,
      actionLoading,
      error,
      fetchSubscription,
      isFeatureAllowed,
      canAddBorrower,
      clearError,
    }),
    [
      subscription,
      loading,
      actionLoading,
      error,
      fetchSubscription,
      isFeatureAllowed,
      canAddBorrower,
      clearError,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
