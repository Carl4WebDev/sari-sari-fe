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

  const stepContent: Record<
    number,
    { title: string; desc: string; actionLabel: string; icon: string }
  > = {
    1: {
      title: t("tutorial.welcome_title"),
      desc: t("tutorial.welcome_desc"),
      actionLabel: t("tutorial.add_borrower_btn"),
      icon: "👋",
    },
    2: {
      title: t("tutorial.add_products_title"),
      desc: t("tutorial.add_products_desc"),
      actionLabel: t("tutorial.got_it"),
      icon: "📦",
    },
    3: {
      title: t("tutorial.loan_ready_title"),
      desc: t("tutorial.loan_ready_desc"),
      actionLabel: t("tutorial.got_it"),
      icon: "🧾",
    },
  };

  const content = stepContent[step];

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transform transition-transform duration-300 ease-out ${
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
                    ? "bg-[#1E3A8A]"
                    : s < step
                    ? "bg-green-400"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {t("tutorial.skip")}
          </button>
        </div>

        {/* Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
          {content.icon}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-[#1E3A8A]">
          {content.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {content.desc}
        </p>

        {/* Action button */}
        <button
          onClick={onAction}
          className="mt-6 w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white transition hover:bg-[#172E6B]"
        >
          {content.actionLabel}
        </button>
      </div>
    </div>
  );
}
