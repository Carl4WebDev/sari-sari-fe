import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface Stats {
  total_collected: number;
  total_expected: number;
  on_time_rate: number;
  done_count: number;
  pending_count: number;
  overdue_count: number;
  total_reminders: number;
}

interface TrendPoint {
  date: string;
  total: number;
}

interface Props {
  stats: Stats | null;
  trend: TrendPoint[];
  period: "week" | "month";
  onPeriodChange: (period: "week" | "month") => void;
}

export default function CollectionStats({
  stats,
  trend,
  period,
  onPeriodChange,
}: Props) {
  const { t } = useTranslation();

  if (!stats) {
    return (
      <div className="rounded-[2rem] border border-slate-200/90 bg-white p-12 text-center shadow-2xs space-y-3">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-50 text-slate-400 border border-slate-200/80 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-sm font-black text-slate-800">No Collection Data</h4>
        <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">{t("stats.no_data")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
            {t("stats.title")}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">{t("stats.subtitle")}</p>
        </div>

        <div className="flex gap-1 rounded-2xl bg-slate-200/70 p-1.5 border border-slate-200/90 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onPeriodChange("week")}
            className={`rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "week"
                ? "bg-slate-900 text-white shadow-xs scale-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            }`}
          >
            {t("stats.this_week")}
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("month")}
            className={`rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "month"
                ? "bg-slate-900 text-white shadow-xs scale-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            }`}
          >
            {t("stats.this_month")}
          </button>
        </div>
      </div>

      {/* Hero Collection Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-7 text-white shadow-xl border border-blue-400/30">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-100/90 block">
              {t("stats.collected")}
            </span>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              ₱{stats.total_collected.toLocaleString()}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-full bg-white/15 backdrop-blur-xs text-white border border-white/20 text-xs font-black shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t("stats.on_time_rate")}: {stats.on_time_rate}%</span>
          </div>
        </div>
      </div>

      {/* Mini Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
        {/* Expected Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              {t("stats.expected")}
            </span>
            <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shadow-2xs shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₱{stats.total_expected.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Total projected dues</p>
          </div>
        </div>

        {/* On-Time Rate Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              {t("stats.on_time_rate")}
            </span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shadow-2xs shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {stats.on_time_rate}%
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Prompt payment ratio</p>
          </div>
        </div>

        {/* Done Count Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              {t("stats.collections_done")}
            </span>
            <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shadow-2xs shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats.done_count}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Settled reminders</p>
          </div>
        </div>
      </div>

      {/* Daily Collection Trend Chart */}
      <div className="rounded-[2rem] bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 shadow-2xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                {t("stats.trend_title")}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {t("stats.trend_subtitle")}
              </p>
            </div>
          </div>
        </div>

        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₱${v >= 1000 ? `${v / 1000}k` : v}`}
              />
              <Tooltip
                formatter={(value: any) => [`₱${Number(value || 0).toLocaleString()}`, "Collected"]}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "16px",
                  border: "1px solid #1E293B",
                  color: "#FFFFFF",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {trend.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.total > 0 ? "#3B82F6" : "#E2E8F0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center space-y-2">
            <p className="text-sm font-black text-slate-800">No Collection History</p>
            <p className="text-xs font-semibold text-slate-400">{t("stats.no_data")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
