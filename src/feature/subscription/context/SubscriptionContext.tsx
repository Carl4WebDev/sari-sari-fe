import { createContext } from "react";

export interface SubscriptionLimits {
  id: string;
  name: string;
  monthlyPrice: number;
  maxBorrowers: number;
  allowSms: boolean;
  allowCustomPdf: boolean;
  allowCsvExport: boolean;
  allowCloudSync: boolean;
  prioritySupport?: boolean;
}

export interface SubscriptionData {
  subscription_id?: number;
  user_id?: number;
  plan: "FREE" | "PREMIUM" | string;
  status: "active" | "cancelled" | "expired" | "no subscription" | string;
  billing_cycle?: "monthly" | "annual" | string;
  amount?: number;
  payment_method?: string;
  payment_reference?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_free?: boolean;
  limits?: SubscriptionLimits;
}

export interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<any>;
  isFeatureAllowed: (feature: keyof SubscriptionLimits) => boolean;
  canAddBorrower: (currentBorrowerCount: number) => boolean;
  clearError: () => void;
}

export const SubscriptionContext = createContext<SubscriptionContextType | null>(null);
