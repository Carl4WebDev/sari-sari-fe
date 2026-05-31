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
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {t("stats.title")}
          </h2>
          <p className="text-sm text-gray-500">{t("stats.subtitle")}</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => onPeriodChange("week")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "week"
                ? "bg-[#1E3A8A] text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("stats.this_week")}
          </button>
          <button
            onClick={() => onPeriodChange("month")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "month"
                ? "bg-[#1E3A8A] text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("stats.this_month")}
          </button>
        </div>
      </div>

      {/* Hero Stat */}
      <div className="rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] p-5 text-white">
        <p className="text-sm opacity-80">{t("stats.collected")}</p>
        <p className="text-3xl font-bold">
          ₱{stats.total_collected.toLocaleString()}
        </p>
        <p className="mt-1 text-sm opacity-80">
          {t("stats.on_time_rate")}: {stats.on_time_rate}%
        </p>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("stats.expected")}</p>
          <p className="text-lg font-bold text-gray-800">
            ₱{stats.total_expected.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("stats.on_time_rate")}</p>
          <p className="text-lg font-bold text-green-600">
            {stats.on_time_rate}%
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">{t("stats.collections_done")}</p>
          <p className="text-lg font-bold text-gray-800">{stats.done_count}</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-gray-700">
          {t("stats.trend_title")}
        </h3>
        <p className="mb-3 text-xs text-gray-400">
          {t("stats.trend_subtitle")}
        </p>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₱${v >= 1000 ? `${v / 1000}k` : v}`}
              />
              <Tooltip
                formatter={(value: number) => [`₱${value.toLocaleString()}`, "Collected"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="total" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">
            {t("stats.no_data")}
          </p>
        )}
      </div>
    </div>
  );
}
