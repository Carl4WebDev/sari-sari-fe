import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import GlobalModal from "../../../shared/components/GlobalModal";
import AuthModal from "../../auth/modals/AuthModal";
import { useSubscription } from "../context/useSubscription";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: (mode: "login" | "register") => void;
}

export default function SubscriptionModal({ isOpen, onClose, onOpenAuth }: SubscriptionModalProps) {
  const { t, language } = useTranslation();
  const { subscription, subscribe, actionLoading } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const activePlan = (subscription?.plan || localStorage.getItem("user_subscription_plan") || "standard").toLowerCase();

  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
  });

  if (!isOpen && !isAuthModalOpen) return null;

  const handleSelectPlan = async (planId: string, planName: string) => {
    const token = localStorage.getItem("user_token");
    const isDemoMode = localStorage.getItem("is_demo_mode") === "true";
    
    // If user has NO real account / is unauthenticated
    if (!token && !isDemoMode) {
      if (onOpenAuth) {
        onOpenAuth("register");
      } else {
        setIsAuthModalOpen(true);
      }
      return;
    }

    setSelectedPlanId(planId);
    const res = await subscribe({
      plan: planId.toUpperCase(),
      billing_cycle: billingCycle,
      payment_method: "GCASH",
    });

    setSelectedPlanId(null);

    const isFil = language === "fil";
    if (res?.ok) {
      setGlobalModal({
        isOpen: true,
        title: isFil ? "Nabayaran / Napili na ang Plan!" : "Plan Selected Successfully!",
        message: isFil
          ? `Ang iyong tindahan ay kasalukuyan nang naka-subskriba sa ${planName} (${billingCycle === "annual" ? "Taunan" : "Buwanan"}) Plan!`
          : `Your store is now active on the ${planName} (${billingCycle.toUpperCase()}) Plan!`,
        type: "success",
      });
    } else {
      setGlobalModal({
        isOpen: true,
        title: isFil ? "May Error" : "Subscription Error",
        message: res?.message || "Failed to update subscription",
        type: "error",
      });
    }
  };

  const plans = [
    {
      id: "basic",
      name: "BASIC",
      monthlyPrice: "₱149",
      annualPrice: "₱119",
      period: billingCycle === "annual" ? "/mo (billed annually)" : "/mo",
      features: [
        { text: "Up to 50 Borrowers", included: true },
        { text: "Manual Loan & Payment Records", included: true },
        { text: "Basic PDF Statement Export", included: true },
        { text: "SMS Collection Reminders", included: false },
        { text: "Cloud Sync & Multi-Device", included: false },
        { text: "Priority 24/7 VIP Support", included: false },
      ],
      popular: false,
    },
    {
      id: "standard",
      name: "STANDARD",
      monthlyPrice: "₱299",
      annualPrice: "₱239",
      period: billingCycle === "annual" ? "/mo (billed annually)" : "/mo",
      features: [
        { text: "Up to 250 Borrowers", included: true },
        { text: "Unlimited Loan & Payment Records", included: true },
        { text: "Custom PDF & CSV Exporting", included: true },
        { text: "SMS Collection Reminders", included: true },
        { text: "Cloud Sync & Multi-Device", included: true },
        { text: "Priority 24/7 VIP Support", included: false },
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "PREMIUM",
      monthlyPrice: "₱499",
      annualPrice: "₱399",
      period: billingCycle === "annual" ? "/mo (billed annually)" : "/mo",
      features: [
        { text: "UNLIMITED Borrowers & Records", included: true },
        { text: "Unlimited Loan & Payment Logs", included: true },
        { text: "Custom PDF & CSV Exporting", included: true },
        { text: "Automatic SMS & Email Reminders", included: true },
        { text: "Real-time Cloud Sync & Backup", included: true },
        { text: "Priority 24/7 VIP Support", included: true },
      ],
      popular: false,
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-backdrop-fade">
          <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[95vh] flex flex-col justify-between overflow-y-auto text-white animate-modal-pop">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800 z-10 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header Section */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                LISTAHUB VIP PLANS
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Pumili ng Plan Para sa Iyong Tindahan
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-normal font-medium">
                Palakihin ang iyong sari-sari store negosyo gamit ang premium tracking, automated SMS reminders, ug cloud sync.
              </p>
            </div>

            {/* Monthly / Annual Billing Toggle Switch */}
            <div className="flex items-center justify-center gap-4 py-1">
              <span className={`text-xs sm:text-sm font-extrabold ${billingCycle === "monthly" ? "text-white" : "text-slate-400"}`}>
                Monthly
              </span>

              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className="relative w-14 h-7 rounded-full bg-slate-800 border border-slate-700 p-1 cursor-pointer transition-colors duration-300 focus:outline-none"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md transform transition-transform duration-300 ${
                    billingCycle === "annual" ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>

              <span className={`text-xs sm:text-sm font-extrabold flex items-center gap-2 ${billingCycle === "annual" ? "text-white" : "text-slate-400"}`}>
                Annual
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </span>
            </div>

            {/* 3 Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-1">
              {plans.map((plan) => {
                const displayPrice = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
                const isCurrentPlan = activePlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-slate-900 border ${
                      isCurrentPlan
                        ? "border-2 border-emerald-400 ring-2 ring-emerald-500/30 shadow-emerald-950/40"
                        : plan.popular
                        ? "border-2 border-blue-500 shadow-blue-900/20"
                        : "border border-slate-800 hover:border-slate-700"
                    } rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5`}
                  >
                    {/* Top Pill Header */}
                    <div className={`py-3 px-5 text-center font-black tracking-widest text-xs sm:text-sm text-white relative ${
                      isCurrentPlan
                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600"
                        : plan.name === "PREMIUM"
                        ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500"
                        : plan.name === "STANDARD"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "bg-gradient-to-r from-slate-700 to-slate-800"
                    } shadow-xs`}>
                      <span>{plan.name}</span>
                      {isCurrentPlan && (
                        <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                          {language === "fil" ? "Kasalukuyan" : "Active"}
                        </span>
                      )}
                    </div>

                    <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                      {/* Price Display */}
                      <div className="text-center space-y-0.5">
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {displayPrice}
                        </div>
                        <div className="text-xs font-bold text-slate-400">
                          {plan.period}
                        </div>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-3 py-1 text-xs sm:text-sm">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            {feat.included ? (
                              <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            <span className={feat.included ? "text-slate-200 font-semibold" : "text-slate-500 font-normal line-through opacity-70"}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Select / Current Plan Button */}
                      <button
                        onClick={() => handleSelectPlan(plan.id, plan.name)}
                        disabled={actionLoading || isCurrentPlan}
                        className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition active:scale-95 border flex items-center justify-center gap-2 ${
                          isCurrentPlan
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 cursor-default opacity-95"
                            : plan.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-lg shadow-blue-600/30 disabled:opacity-50"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 disabled:opacity-50"
                        }`}
                      >
                        {actionLoading && selectedPlanId === plan.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{language === "fil" ? "Pinoproseso..." : "Processing..."}</span>
                          </div>
                        ) : isCurrentPlan ? (
                          <>
                            <svg className="w-4 h-4 text-emerald-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            <span>{language === "fil" ? "Kasalukuyang Plan" : "Current Plan"}</span>
                          </>
                        ) : (
                          <span>{language === "fil" ? "Pumili ng Plan" : "Select Plan"}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Trigger AuthModal if user is not logged in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode="register"
        onClose={() => setIsAuthModalOpen(false)}
      />

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type}
        onClose={() => setGlobalModal({ ...globalModal, isOpen: false })}
      />
    </>
  );
}
