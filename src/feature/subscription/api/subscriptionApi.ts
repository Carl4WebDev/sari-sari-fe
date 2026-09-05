import { apiRequest } from "../../auth/api/httpClient/httpClient";

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

export const getCurrentSubscriptionApi = () =>
  apiRequest("/api/subscriptions/current", {
    method: "GET",
  });

export const subscribePlanApi = (payload: SubscribePayload) =>
  apiRequest("/api/subscriptions/subscribe", {
    method: "POST",
    body: payload,
  });

export const cancelSubscriptionApi = () =>
  apiRequest("/api/subscriptions/cancel", {
    method: "POST",
  });
