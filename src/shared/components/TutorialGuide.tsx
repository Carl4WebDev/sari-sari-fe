import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

interface Props {
  visible: boolean;
  step: 1 | 2 | 3;
  onAction: () => void;
  onSkip: () => void;
}

export default function TutorialGuide({
  visible,
  step,
  onAction,
  onSkip,
}: Props) {
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [visible]);

  if (!visible) return null;

  const renderIcon = (step: number) => {
    switch (step) {
      case 1:
        return (
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 2:
        return (
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 3:
        return (
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const stepContent: Record<
    number,
    { title: string; desc: string; actionLabel: string }
  > = {
    1: {
      title: t("tutorial.welcome_title"),
      desc: t("tutorial.welcome_desc"),
      actionLabel: t("tutorial.add_borrower_btn"),
    },
    2: {
      title: t("tutorial.add_products_title"),
      desc: t("tutorial.add_products_desc"),
      actionLabel: t("tutorial.got_it"),
    },
    3: {
      title: t("tutorial.loan_ready_title"),
      desc: t("tutorial.loan_ready_desc"),
      actionLabel: t("tutorial.got_it"),
    },
  };

  const content = stepContent[step];

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`mx-4 w-full max-w-sm rounded-[2rem] bg-white/95 backdrop-blur-xl p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 transform transition-transform duration-300 ease-out ${
          animate ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >
        {/* Step indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  s === step
                    ? "bg-blue-600"
                    : s < step
                    ? "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {t("tutorial.skip")}
          </button>
        </div>

        {/* Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 shadow-2xs">
          {renderIcon(step)}
        </div>

        {/* Content */}
        <h3 className="text-base font-black text-slate-950 tracking-tight">
          {content.title}
        </h3>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
          {content.desc}
        </p>

        {/* Action button */}
        <button
          onClick={onAction}
          className="mt-6 w-full rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
        >
          {content.actionLabel}
        </button>
      </div>
    </div>
  );
}
