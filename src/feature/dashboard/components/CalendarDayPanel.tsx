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

  const getStatusColor = (status: string) => {
    if (status === "OVERDUE") return "bg-red-100 text-red-700";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {formattedDate}
            </h3>
            <p className="text-sm text-gray-500">
              {reminders.length}{" "}
              {reminders.length === 1 ? "reminder" : "reminders"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            &#10005;
          </button>
        </div>

        {/* Reminder List */}
        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {reminders.map((reminder) => (
            <div
              key={reminder.reminder_id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
            >
              <div className="flex-1">
                <Link
                  to={`/borrowers/${reminder.borrower_id}`}
                  onClick={onClose}
                  className="font-medium text-[#1E3A8A] hover:underline"
                >
                  {reminder.borrower_name}
                </Link>
                <p className="text-sm text-gray-600">
                  ₱{Number(reminder.amount_expected).toLocaleString()}
                </p>
                {reminder.note && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {reminder.note}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(reminder.status)}`}
                >
                  {reminder.status}
                </span>
                {reminder.status !== "DONE" && (
                  <button
                    onClick={() => onMarkDone(reminder.reminder_id)}
                    className="rounded-lg bg-green-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-600"
                  >
                    {t("reminder.mark_done")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
