import { useMemo, useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface CalendarReminder {
  reminder_id: number;
  borrower_id: number;
  borrower_name: string;
  amount_expected: number;
  status: string;
  note: string;
}

interface CalendarDayData {
  due_date: string;
  reminders: CalendarReminder[];
}

interface Props {
  calendarData: CalendarDayData[];
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: string, reminders: CalendarReminder[]) => void;
}

const DAY_LABELS = ["calendar.sun", "calendar.mon", "calendar.tue", "calendar.wed", "calendar.thu", "calendar.fri", "calendar.sat"] as const;

export default function CollectionCalendar({
  calendarData,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: Props) {
  const { t } = useTranslation();

  // Build a map of date -> reminders for quick lookup
  const reminderMap = useMemo(() => {
    const map: Record<string, CalendarReminder[]> = {};
    for (const entry of calendarData) {
      map[entry.due_date] = entry.reminders;
    }
    return map;
  }, [calendarData]);

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=Sun

    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month trailing days
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    // Next month leading days (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    return days;
  }, [year, month]);

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });

  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getDayColor = (reminders: CalendarReminder[]) => {
    if (!reminders || reminders.length === 0) return null;
    if (reminders.some((r) => r.status === "OVERDUE"))
      return "bg-red-100 border-red-300";
    if (reminders.some((r) => r.status === "PENDING"))
      return "bg-yellow-100 border-yellow-300";
    return "bg-green-100 border-green-300";
  };

  const getDotColor = (status: string) => {
    if (status === "OVERDUE") return "bg-red-500";
    if (status === "PENDING") return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {t("calendar.title")}
          </h2>
          <p className="text-sm text-gray-500">{t("calendar.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            &#8249;
          </button>
          <span className="min-w-[140px] text-center font-semibold text-gray-700">
            {monthName}
          </span>
          <button
            onClick={onNextMonth}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-xs font-medium text-gray-400"
          >
            {t(label)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell) => {
          const reminders = reminderMap[cell.dateStr];
          const hasReminders = reminders && reminders.length > 0;
          const isToday = cell.dateStr === todayStr;
          const colorClass = getDayColor(reminders);

          return (
            <button
              key={cell.dateStr}
              onClick={() => {
                if (hasReminders) {
                  onDayClick(cell.dateStr, reminders);
                }
              }}
              className={`relative flex min-h-[3.5rem] flex-col items-center rounded-lg border p-1.5 transition-colors ${
                cell.isCurrentMonth ? "" : "opacity-30"
              } ${hasReminders ? `cursor-pointer ${colorClass}` : "border-gray-100 hover:bg-gray-50"} ${isToday ? "ring-2 ring-[#1E3A8A]" : ""}`}
            >
              <span
                className={`text-sm font-medium ${isToday ? "text-[#1E3A8A]" : "text-gray-700"}`}
              >
                {cell.day}
              </span>
              {hasReminders && (
                <div className="mt-0.5 flex gap-0.5">
                  {reminders.slice(0, 3).map((r, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${getDotColor(r.status)}`}
                    />
                  ))}
                  {reminders.length > 3 && (
                    <span className="text-[8px] text-gray-500">
                      +{reminders.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
