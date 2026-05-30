import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface Props {
  isOpen: boolean;
  isClose: () => void;
  reminders: {
    todays_collections?: any[];
    overdue?: any[];
    upcoming?: any[];
  };
  onMarkDone: (reminderId: number) => Promise<void>;
  onRemindAgain?: (reminderId: number) => Promise<void>;
}

export default function ReminderNotificationModal({
  isOpen,
  isClose,
  reminders,
  onMarkDone,
  onRemindAgain,
}: Props) {
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todays = reminders?.todays_collections || [];
  const overdue = reminders?.overdue || [];
  const upcoming = reminders?.upcoming || [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={isClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 left-0 w-full bg-white
          rounded-b-2xl shadow-xl
          transform transition-transform duration-300 ease-out
          ${animate ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="mx-auto max-h-[85vh] max-w-2xl overflow-y-auto p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#1E3A8A]">
                Collection Reminders
              </h2>

              <p className="text-sm text-gray-500">
                Track today, overdue, and upcoming collections.
              </p>
            </div>

            <button
              onClick={isClose}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600"
            >
              Close
            </button>
          </div>

<ReminderSection
  title="Today's Collections"
  items={todays}
  emptyText="No collections for today."
  badgeClass="bg-[#1E3A8A] text-white"
  onMarkDone={onMarkDone}
/>

<ReminderSection
  title="Overdue Borrowers"
  items={overdue}
  emptyText="No overdue reminders."
  badgeClass="bg-red-500 text-white"
  onMarkDone={onMarkDone}
  onRemindAgain={onRemindAgain}
/>

<ReminderSection
  title="Upcoming Reminders"
  items={upcoming}
  emptyText="No upcoming reminders."
  badgeClass="bg-[#16A34A] text-white"
  onMarkDone={onMarkDone}
/>
        </div>
      </div>
    </div>
  );
}

function ReminderSection({
  title,
  items,
  emptyText,
  badgeClass,
  onMarkDone,
  onRemindAgain,
}: {
  title: string;
  items: any[];
  emptyText: string;
  badgeClass: string;
  onMarkDone: (reminderId: number) => Promise<void>;
  onRemindAgain?: (reminderId: number) => Promise<void>;
}) {

  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          {title}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
          {emptyText}
        </div>
      ) : (

        
        <div className="space-y-2">
{items.map((item: any) => (
  <div
    key={item.reminder_id}
    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
  >
              <div className="flex justify-between gap-3">
                <div>
<Link
  to={`/borrowers/${item.borrower_id}`}
  className="text-sm font-semibold text-gray-800 transition hover:text-[#1E3A8A] hover:underline"
>
  {item.first_name} {item.last_name}
</Link>

                  <p className="mt-1 text-xs text-gray-500">
                    Due:{" "}
                    {new Date(item.due_date).toLocaleDateString()}
                  </p>

                  {item.note && (
                    <p className="mt-2 text-sm text-gray-600">
                      {item.note}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-[#1E3A8A]">
                    ₱
                    {Number(
                      item.amount_expected || 0
                    ).toLocaleString()}
                  </p>

<div className="mt-3 flex gap-2">
  <button
    onClick={async () => {
      await onMarkDone(item.reminder_id);
      navigate(`/borrowers/${item.borrower_id}`, {
        state: { openPayment: true },
      });
    }}
    className="rounded-lg bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white"
  >
    Mark Done
  </button>
  {onRemindAgain && (
    <button
      onClick={async () => {
        await onRemindAgain(item.reminder_id);
      }}
      className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white"
    >
      Remind Again
    </button>
  )}
</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}