import { apiRequest } from "../../auth/api/httpClient/httpClient";
import { subscriptionRequest } from "../api";
import type { SubscriptionData } from "../context/SubscriptionContext";

export interface SubscribePayload {
  plan: "BASIC" | "STANDARD" | "PREMIUM" | string;
  billing_cycle: "monthly" | "annual";
  payment_method?: "GCASH" | "MAYA" | "CARD" | "CASH" | string;
  payment_reference?: string;
}

export const getPlansApi = () =>
  apiRequest("/api/subscriptions/plans", {
    method: "GET",
  });

export const getCurrentSubscriptionApi = async () => {
  try { return { ok: true, data: await subscriptionRequest<SubscriptionData>('/current') }; }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : 'Unable to load subscription.' }; }
};

export const subscribePlanApi = (payload: SubscribePayload) =>
  apiRequest("/api/subscriptions/subscribe", {
    method: "POST",
    body: payload,
  });

export const cancelSubscriptionApi = () =>
  apiRequest("/api/subscriptions/cancel", {
    method: "POST",
  });
