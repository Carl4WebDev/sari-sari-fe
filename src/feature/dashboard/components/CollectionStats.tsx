import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-center text-gray-400">{t("stats.no_data")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("stats.title")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">{t("stats.subtitle")}</p>
        </div>
        <div className="flex gap-1 rounded-2xl bg-slate-200/60 p-1 border border-slate-200/90 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onPeriodChange("week")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "week"
                ? "bg-slate-950 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {t("stats.this_week")}
          </button>
          <button
            onClick={() => onPeriodChange("month")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              period === "month"
                ? "bg-slate-950 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {t("stats.this_month")}
          </button>
        </div>
      </div>

      {/* Hero Collection Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl border border-blue-400/30">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-100 block">
              {t("stats.collected")}
            </span>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              ₱{stats.total_collected.toLocaleString()}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white border border-white/20 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t("stats.on_time_rate")}: {stats.on_time_rate}%</span>
          </div>
        </div>
      </div>

      {/* Mini Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">{t("stats.expected")}</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
            ₱{stats.total_expected.toLocaleString()}
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">{t("stats.on_time_rate")}</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight mt-2">
            {stats.on_time_rate}%
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">{t("stats.collections_done")}</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
            {stats.done_count}
          </p>
        </div>
      </div>

      {/* Daily Collection Trend Chart */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {t("stats.trend_title")}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {t("stats.trend_subtitle")}
          </p>
        </div>

        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
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
                formatter={(value: number) => [`₱${value.toLocaleString()}`, "Collected"]}
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
              <Bar dataKey="total" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-sm font-semibold text-slate-400">
            {t("stats.no_data")}
          </p>
        )}
      </div>
    </div>
  );
}
