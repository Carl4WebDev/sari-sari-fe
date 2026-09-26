import { useEffect, useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import AuthModal from "../../auth/modals/AuthModal";
import { subscriptionRequest } from "../api";
import type { Customer } from "../api";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: (mode: "login" | "register") => void;
}

export default function SubscriptionModal({ isOpen, onClose, onOpenAuth }: SubscriptionModalProps) {
  const { t } = useTranslation();
  const [activePlan, setActivePlan] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !localStorage.getItem('user_token') || localStorage.getItem('is_demo_mode') === 'true' || localStorage.getItem('is_free_local') === 'true') return;
    subscriptionRequest<{ customer: Customer }>('/mine').then(({ customer }) => {
      setActivePlan(['Active', 'Expiring soon'].includes(customer.status) ? customer.plan || '' : '');
    }).catch(() => setActivePlan(''));
  }, [isOpen]);

  if (!isOpen && !isAuthModalOpen) return null;

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      onClose();
      return;
    }

    // Premium: show beta contact info
    if (planId === "premium") {
      setShowPremiumBeta(true);
      return;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Choose Your Plan</h2>
              <p className="text-sm text-slate-500">Start free or go Premium for cloud features</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* FREE Card */}
            <div className={`relative rounded-2xl border-2 p-6 transition ${activePlan === "" || activePlan === "free"
              ? "border-emerald-400 bg-emerald-50/50"
              : "border-slate-200 bg-white hover:border-slate-300"
              }`}>
              {(activePlan === "" || activePlan === "free") && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-900">FREE</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₱0</span>
                  <span className="text-sm text-slate-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Complete local and offline loan management.</p>
              </div>

              <ul className="mb-6 space-y-2.5">
                {[
                  "Unlimited Borrowers",
                  "Unlimited Loan & Payment Records",
                  "All Core Functionalities",
                  "Basic PDF & Excel Export",
                  "Email",
                  "Offline Access",
                  "Local Storage",
                  "Automatic Backup / Data Export",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan("free")}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition cursor-pointer active:scale-95 ${activePlan === "" || activePlan === "free"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {activePlan === "" || activePlan === "free" ? "Your Current Plan" : "Start for Free"}
              </button>
            </div>

            {/* PREMIUM Card */}
            <div className={`relative rounded-2xl border-2 p-6 transition ${activePlan === "premium"
              ? "border-amber-400 bg-amber-50/50"
              : "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-300"
              }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                  {activePlan === "premium" ? "Current Plan" : "Premium"}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-900">PREMIUM</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₱299</span>
                  <span className="text-sm text-slate-500">/month</span>
                </div>
                <p className="mt-1 text-xs text-amber-600 font-semibold">₱3,229.20/year — Save 10%</p>
                <p className="mt-2 text-sm text-slate-600">Take your store management to the cloud.</p>
              </div>

              <ul className="mb-6 space-y-2.5">
                {[
                  "Everything in Free",
                  "Cloud Storage",
                  "Automatic Cloud Backup",
                  "Real-Time Synchronization",
                  "Multi-Device Access",
                  "SMS Collection Reminders",
                  "Custom PDF & Excel/CSV Exporting",
                  "Priority VIP Support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {activePlan === "premium" ? (
                <button
                  disabled
                  className="w-full rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-700 cursor-default"
                >
                  Your Current Plan
                </button>
              ) : (
                <div>
                  <button
                    onClick={() => handleSelectPlan("premium")}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:from-amber-600 hover:to-yellow-600 cursor-pointer active:scale-95"
                  >
                    Contact to Subscribe
                  </button>
                  <div className="mt-2 text-center text-xs text-slate-500 space-y-1">
                    <p>Want Premium? Contact the Listahub administrator to arrange your subscription and payment.</p>
                    <p className="font-bold text-slate-700">📞 0927 616 8478</p>
                    <p>Mostly available on Saturdays & Sundays, but feel free to call anytime — I&apos;ll call back if I miss your call.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border-t border-slate-100 px-6 py-6">
            <h3 className="mb-4 text-center text-lg font-black text-slate-900">Compare Plans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 text-left font-bold text-slate-700">Feature</th>
                    <th className="py-3 text-center font-bold text-slate-700">Free</th>
                    <th className="py-3 text-center font-bold text-amber-600">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Price", free: "₱0/month", premium: "₱299/month" },
                    { feature: "Borrowers", free: "Unlimited", premium: "Unlimited" },
                    { feature: "Loan & Payment Records", free: "Unlimited", premium: "Unlimited" },
                    { feature: "PDF Statement Export", free: "Basic", premium: "Custom" },
                    { feature: "Excel/CSV Export", free: "Basic", premium: "Custom" },
                    { feature: "Email", free: "✓", premium: "✓" },
                    { feature: "Local Storage", free: "✓", premium: "✓" },
                    { feature: "Offline Access", free: "✓", premium: "✓" },
                    { feature: "Automatic Backup / Data Export", free: "✓", premium: "✓" },
                    { feature: "Cloud Storage", free: "—", premium: "✓" },
                    { feature: "Cloud Sync", free: "—", premium: "✓" },
                    { feature: "Multi-Device Access", free: "—", premium: "✓" },
                    { feature: "Automatic Cloud Backup", free: "—", premium: "✓" },
                    { feature: "Real-Time Synchronization", free: "—", premium: "✓" },
                    { feature: "SMS Collection Reminders", free: "—", premium: "✓" },
                    { feature: "Priority VIP Support", free: "—", premium: "✓" },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-slate-100">
                      <td className="py-2.5 text-slate-700">{row.feature}</td>
                      <td className="py-2.5 text-center">
                        {row.free === "✓" ? (
                          <span className="text-emerald-500">✓</span>
                        ) : row.free === "—" ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <span className="text-slate-600">{row.free}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {row.premium === "✓" ? (
                          <span className="text-amber-500">✓</span>
                        ) : row.premium === "—" ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <span className="text-slate-600">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="register"
        />
      )}
    </>
  );
}
