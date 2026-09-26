import { apiRequest } from "../../auth/api/httpClient/httpClient";
import { subscriptionRequest } from "../api";
import type { SubscriptionData } from "../context/SubscriptionContext";

export const getPlansApi = () =>
  apiRequest("/api/subscriptions/plans", {
    method: "GET",
  });

export const getCurrentSubscriptionApi = async () => {
  try {
    return { ok: true, data: await subscriptionRequest<SubscriptionData>('/current') };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unable to load subscription.' };
  }
};
