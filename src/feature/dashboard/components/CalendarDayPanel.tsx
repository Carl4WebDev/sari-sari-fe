import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Link } from "react-router-dom";

interface CalendarReminder {
  reminder_id: number;
  borrower_id: number;
  borrower_name: string;
  amount_expected: number;
  status: string;
  note: string;
}

interface Props {
  isOpen: boolean;
  date: string;
  reminders: CalendarReminder[];
  onClose: () => void;
  onMarkDone: (reminderId: number) => Promise<void>;
}

export default function CalendarDayPanel({
  isOpen,
  date,
  reminders,
  onClose,
  onMarkDone,
}: Props) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const getStatusBadge = (status: string) => {
    if (status === "OVERDUE")
      return {
        label: "Overdue",
        cls: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500",
      };
    if (status === "PENDING")
      return {
        label: "Pending",
        cls: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
      };
    return {
      label: "Collected / Done",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
    };
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-backdrop-fade"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-pop"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                {formattedDate}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {reminders.length} {reminders.length === 1 ? "collection reminder" : "collection reminders"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Reminder List Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {reminders.length === 0 ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              No collection reminders for this date
            </div>
          ) : (
            reminders.map((reminder) => {
              const badge = getStatusBadge(reminder.status);
              return (
                <div
                  key={reminder.reminder_id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2.5 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/borrowers/${reminder.borrower_id}`}
                        onClick={onClose}
                        className="text-sm font-black text-slate-900 hover:text-blue-600 transition"
                      >
                        {reminder.borrower_name}
                      </Link>
                      <div className="text-base font-black text-slate-950 mt-0.5">
                        ₱{Number(reminder.amount_expected).toLocaleString()}
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border ${badge.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {reminder.note && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
                      "{reminder.note}"
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <Link
                      to={`/borrowers/${reminder.borrower_id}`}
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      View Profile
                    </Link>

                    {reminder.status !== "DONE" && (
                      <button
                        type="button"
                        onClick={() => onMarkDone(reminder.reminder_id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 transition active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{t("reminder.mark_done")}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
