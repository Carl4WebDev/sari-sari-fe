import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import {
  SubscriptionContext,
  type SubscriptionData,
  type SubscriptionLimits,
} from "./SubscriptionContext";
import {
  getCurrentSubscriptionApi,
  subscribePlanApi,
  cancelSubscriptionApi,
} from "../api/subscriptionApi";

const DEFAULT_FREE_LIMITS: SubscriptionLimits = {
  id: "free",
  name: "FREE",
  monthlyPrice: 0,
  annualPriceMonthly: 0,
  maxBorrowers: 15,
  allowSms: false,
  allowCustomPdf: false,
  allowCsvExport: false,
  allowCloudSync: true,
};

const DEFAULT_FREE_SUBSCRIPTION: SubscriptionData = {
  plan: "FREE",
  status: "active",
  billing_cycle: "monthly",
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
      const savedPlan = localStorage.getItem("user_subscription_plan");
      if (savedPlan) {
        return {
          ...DEFAULT_FREE_SUBSCRIPTION,
          plan: savedPlan.toUpperCase(),
        };
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
      const savedPlan = localStorage.getItem("user_subscription_plan") || "standard";
      const demoSub: SubscriptionData = {
        plan: savedPlan.toUpperCase(),
        status: "active",
        billing_cycle: "annual",
        is_free: false,
        limits: {
          id: savedPlan.toLowerCase(),
          name: savedPlan.toUpperCase(),
          monthlyPrice: 299,
          annualPriceMonthly: 239,
          maxBorrowers: 250,
          allowSms: true,
          allowCustomPdf: true,
          allowCsvExport: true,
          allowCloudSync: true,
        },
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

  const subscribe = useCallback(
    async (payload: {
      plan: string;
      billing_cycle: "monthly" | "annual";
      payment_method?: string;
      payment_reference?: string;
    }) => {
      setActionLoading(true);
      setError(null);

      const isDemo = localStorage.getItem("is_demo_mode") === "true";
      if (isDemo) {
        const demoSub: SubscriptionData = {
          plan: payload.plan.toUpperCase(),
          status: "active",
          billing_cycle: payload.billing_cycle,
          is_free: false,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          limits: {
            id: payload.plan.toLowerCase(),
            name: payload.plan.toUpperCase(),
            monthlyPrice: payload.plan.toUpperCase() === "PREMIUM" ? 499 : 299,
            annualPriceMonthly: payload.plan.toUpperCase() === "PREMIUM" ? 399 : 239,
            maxBorrowers: payload.plan.toUpperCase() === "PREMIUM" ? 999999 : 250,
            allowSms: true,
            allowCustomPdf: true,
            allowCsvExport: true,
            allowCloudSync: true,
          },
        };
        setSubscription(demoSub);
        localStorage.setItem("user_subscription_plan", payload.plan.toLowerCase());
        localStorage.setItem("user_subscription_data", JSON.stringify(demoSub));
        setActionLoading(false);
        return { ok: true, data: demoSub, message: `Subscribed to ${payload.plan} Plan in Demo Mode` };
      }

      const res = await subscribePlanApi({
        plan: payload.plan,
        billing_cycle: payload.billing_cycle,
        payment_method: payload.payment_method || "GCASH",
        payment_reference: payload.payment_reference,
      });

      if (res?.ok && res.data) {
        setSubscription(res.data);
        localStorage.setItem("user_subscription_data", JSON.stringify(res.data));
        if (res.data.plan) {
          localStorage.setItem("user_subscription_plan", res.data.plan.toLowerCase());
        }
      } else {
        setError(res?.message || "Failed to subscribe to plan");
      }

      setActionLoading(false);
      return res;
    },
    []
  );

  const cancelSubscription = useCallback(async () => {
    setActionLoading(true);
    setError(null);

    const res = await cancelSubscriptionApi();

    if (res?.ok) {
      setSubscription((prev) => ({
        ...prev,
        status: "cancelled",
      }));
    } else {
      setError(res?.message || "Failed to cancel subscription");
    }

    setActionLoading(false);
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
    (currentBorrowerCount: number): boolean => {
      const max = subscription?.limits?.maxBorrowers ?? DEFAULT_FREE_LIMITS.maxBorrowers;
      return currentBorrowerCount < max;
    },
    [subscription]
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
      subscribe,
      cancelSubscription,
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
      subscribe,
      cancelSubscription,
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
