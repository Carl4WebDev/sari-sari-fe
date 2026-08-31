import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

interface Props {
  onAddBorrower: () => void;
  onAddLoan: () => void;
  borrowerCount: number;
}

export default function OnboardingWizard({
  onAddBorrower,
  onAddLoan,
  borrowerCount,
}: Props) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const steps = [
    {
      done: borrowerCount > 0,
      title: t("onboarding.step1_title"),
      description: t("onboarding.step1_desc"),
      action: onAddBorrower,
      actionLabel: t("onboarding.add_borrower"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      done: false,
      title: t("onboarding.step2_title"),
      description: t("onboarding.step2_desc"),
      action: onAddLoan,
      actionLabel: t("onboarding.add_loan"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      disabled: borrowerCount === 0,
    },
  ];

  return (
    <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/50 p-6 space-y-5 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950 tracking-tight">
            {t("onboarding.welcome")}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {t("onboarding.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          {t("onboarding.skip")}
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 rounded-2xl p-4 transition border ${
              step.done
                ? "bg-emerald-50/60 border-emerald-200/80"
                : "bg-white border-slate-200/90 shadow-2xs"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${
                step.done
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-950 text-white"
              }`}
            >
              {step.done ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.icon
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black ${step.done ? "text-emerald-900" : "text-slate-950"}`}>
                {t("onboarding.step_label", { index: index + 1, title: step.title })}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {step.description}
              </p>
            </div>

            {!step.done && (
              <button
                onClick={step.action}
                disabled={step.disabled}
                className="shrink-0 rounded-2xl bg-slate-950 hover:bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {step.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
