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
    <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t("calendar.title")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">{t("calendar.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 border border-slate-200 bg-slate-50/80 rounded-2xl p-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
            title="Previous Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="min-w-[130px] text-center font-black text-xs sm:text-sm text-slate-900">
            {monthName}
          </span>
          <button
            onClick={onNextMonth}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
            title="Next Month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1.5 pt-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1.5 text-center text-xs font-black uppercase tracking-wider text-slate-400"
          >
            {t(label)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
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
              className={`relative flex min-h-[3.8rem] flex-col items-center justify-between rounded-2xl border p-2 transition-all ${
                cell.isCurrentMonth ? "" : "opacity-30"
              } ${hasReminders ? `cursor-pointer ${colorClass} hover:scale-[1.03] shadow-xs` : "border-slate-100/90 hover:bg-slate-50"} ${
                isToday ? "ring-2 ring-blue-600 bg-blue-50/70 font-black border-blue-200 shadow-xs" : ""
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-black ${isToday ? "text-blue-950" : "text-slate-800"}`}
              >
                {cell.day}
              </span>
              {hasReminders && (
                <div className="mt-1 flex gap-1 items-center">
                  {reminders.slice(0, 3).map((r, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full ${getDotColor(r.status)} shadow-xs`}
                    />
                  ))}
                  {reminders.length > 3 && (
                    <span className="text-[9px] font-black text-slate-500">
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
