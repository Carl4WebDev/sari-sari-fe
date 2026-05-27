import { useState } from "react";

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
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const steps = [
    {
      done: borrowerCount > 0,
      title: "Add your first borrower",
      description: "Start by adding a customer who buys on credit (utang).",
      action: onAddBorrower,
      actionLabel: "Add Borrower",
      icon: "👤",
    },
    {
      done: false,
      title: "Record a loan",
      description: "Once you have a borrower, record their first utang with product items.",
      action: onAddLoan,
      actionLabel: "Add Loan",
      icon: "🧾",
      disabled: borrowerCount === 0,
    },
  ];

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#1E3A8A] bg-blue-50 p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Welcome to Listahub! 👋
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Let's get your store set up. Follow these steps to start tracking utang.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg px-3 py-1 text-xs text-gray-500 hover:bg-white"
        >
          Skip
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 rounded-xl p-4 transition ${
              step.done
                ? "bg-green-50 border border-green-200"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                step.done
                  ? "bg-green-500 text-white"
                  : "bg-[#1E3A8A] text-white"
              }`}
            >
              {step.done ? "✓" : step.icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${step.done ? "text-green-700" : "text-gray-800"}`}>
                Step {index + 1}: {step.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {step.description}
              </p>
            </div>

            {!step.done && (
              <button
                onClick={step.action}
                disabled={step.disabled}
                className="shrink-0 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#172E6B] disabled:opacity-40 disabled:cursor-not-allowed"
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
