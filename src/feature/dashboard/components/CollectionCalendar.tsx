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
      return "bg-rose-50/70 border-rose-200/80 hover:bg-rose-100/70 text-rose-900";
    if (reminders.some((r) => r.status === "PENDING"))
      return "bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/70 text-amber-900";
    return "bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/70 text-emerald-900";
  };

  const getDotColor = (status: string) => {
    if (status === "OVERDUE") return "bg-rose-500";
    if (status === "PENDING") return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="rounded-[2rem] bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
              {t("calendar.title")}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{t("calendar.subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50/90 rounded-2xl p-1 shrink-0 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={onPrevMonth}
            className="h-8 w-8 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
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
            type="button"
            onClick={onNextMonth}
            className="h-8 w-8 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
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
            className="py-1.5 text-center text-[11px] font-black uppercase tracking-wider text-slate-400"
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
              type="button"
              onClick={() => {
                if (hasReminders) {
                  onDayClick(cell.dateStr, reminders);
                }
              }}
              className={`relative flex min-h-[4rem] sm:min-h-[4.5rem] flex-col items-center justify-between rounded-2xl border p-2 transition-all duration-200 ${
                cell.isCurrentMonth ? "" : "opacity-30 bg-slate-50/40 border-slate-100"
              } ${hasReminders ? `cursor-pointer ${colorClass} hover:scale-[1.02] shadow-2xs` : "border-slate-100/90 hover:bg-slate-50"} ${
                isToday ? "ring-2 ring-blue-600 bg-blue-50/80 font-black border-blue-300 shadow-sm" : ""
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
                      className={`h-2 w-2 rounded-full ${getDotColor(r.status)} shadow-2xs`}
                    />
                  ))}
                  {reminders.length > 3 && (
                    <span className="text-[9px] font-black text-slate-600 bg-white/80 px-1 rounded-md">
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
