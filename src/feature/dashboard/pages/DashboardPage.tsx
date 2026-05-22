import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LineChart,
  Line,
  YAxis,
} from "recharts";

import AddBorrowerModal from "../modals/AddBorrowerModal";
import AddLoanModal from "../modals/AddLoanModal";
import QuickAddPaymentModal from "../modals/QuickAddPaymentModal";

import { useDashboard } from "../../context/dashboard/useDashboard";

export default function DashboardPage() {
  const {
    dashboard,
    loading,
    fetchDashboard,
  } = useDashboard();

  const [isBorrowerOpen, setIsBorrowerOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [recentBorrower, setRecentBorrower] = useState<any>(null);
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] =
    useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const chartData = [
    {
      name: "Paid",
      value: dashboard?.fully_paid || 0,
    },
    {
      name: "Unpaid",
      value: dashboard?.with_balance || 0,
    },
  ];

  const monthlyUtangTrend =
  dashboard?.monthly_utang_trend || [];

  const topBorrowers = dashboard?.top_borrowers || [];

  return (
    <div className="space-y-6 pb-10">
      <AddBorrowerModal
        isOpen={isBorrowerOpen}
        isClose={() => setIsBorrowerOpen(false)}
        onBorrowerCreated={(borrower) => {
          setRecentBorrower(borrower);
          setIsLoanOpen(true);
        }}
      />

      <AddLoanModal
        isOpen={isLoanOpen}
        isClose={() => setIsLoanOpen(false)}
        borrower={recentBorrower}
      />

      <QuickAddPaymentModal
        isOpen={isQuickPaymentOpen}
        isClose={() => setIsQuickPaymentOpen(false)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500">
          Utang overview
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={() => setIsBorrowerOpen(true)}
          className="w-full rounded-xl bg-[#1E3A8A] py-4 text-lg font-semibold text-white"
        >
          + Add New Borrower
        </button>

        <button
          onClick={() => setIsLoanOpen(true)}
          className="w-full rounded-xl bg-[#1E3A8A] py-4 text-lg font-semibold text-white"
        >
          + Add Loan
        </button>

        <button
          onClick={() => setIsQuickPaymentOpen(true)}
          className="w-full rounded-lg bg-[#16A34A] py-4 font-semibold text-white"
        >
          + Add Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4">
        <SummaryCard
          title="Total Outstanding Utang"
          value={`₱${Number(
            dashboard?.total_utang || 0
          ).toLocaleString()}`}
          highlight
        />

        <SummaryCard
          title="Total Borrowers"
          value={String(
            dashboard?.total_borrowers || 0
          )}
        />

        <SummaryCard
          title="New Borrowers Today"
          value={String(
            dashboard?.new_borrowers_today || 0
          )}
        />

        <SummaryCard
          title="New Borrowers This Month"
          value={String(
            dashboard?.new_borrowers_this_month || 0
          )}
        />
      </div>

      {/* Analytics */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            Borrower Analytics
          </h2>

          <p className="text-sm text-gray-500">
            Paid vs unpaid borrowers
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-400">
  This graph compares borrowers who already paid their balances
  versus borrowers who still have remaining utang.
  Higher unpaid borrowers may indicate collection risk.
</p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#1E3A8A"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Utang Trend */}
<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-[#1E3A8A]">
      Monthly Utang Trend
    </h2>

    <p className="text-sm text-gray-500">
      Total outstanding balance trend per month
    </p>
    <p className="mt-2 text-xs leading-5 text-gray-400">
  This graph shows how total borrower utang changes monthly.
  Rising values may mean more borrowers are taking loans,
  while lower values may indicate stronger collections/payments.
</p>
  </div>

  <div className="h-64">
    {monthlyUtangTrend.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={monthlyUtangTrend}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#1E3A8A"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No monthly trend data yet
      </div>
    )}
  </div>
</div>
{/* Top Borrowers */}
<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-[#1E3A8A]">
      Top Borrowers
    </h2>

    <p className="text-sm text-gray-500">
      Borrowers with the highest remaining balances
    </p>

    <p className="mt-2 text-xs leading-5 text-gray-400">
      Use this to quickly identify customers with the biggest unpaid utang.
      These borrowers may need follow-up or payment reminders first.
    </p>
  </div>

  <div className="space-y-3">
    {topBorrowers.length > 0 ? (
      topBorrowers.map((borrower: any, index: number) => (
        <div
          key={borrower.borrower_id}
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A8A] text-sm font-bold text-white">
              {index + 1}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {borrower.name}
              </p>

              <p className="text-xs text-gray-500">
                High balance borrower
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-red-500">
            ₱{Number(borrower.balance).toLocaleString()}
          </p>
        </div>
      ))
    ) : (
      <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        No unpaid borrowers
      </div>
    )}
  </div>
</div>


      {/* Insights */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1E3A8A]">
          Insights
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Fully Paid Borrowers
            </span>

            <span className="font-semibold text-[#16A34A]">
              {dashboard?.fully_paid || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Borrowers With Balance
            </span>

            <span className="font-semibold text-red-500">
              {dashboard?.with_balance || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Busiest Day
            </span>

            <span className="font-semibold text-gray-800">
              {dashboard?.busiest_day || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Busiest Hour
            </span>

            <span className="font-semibold text-gray-800">
              {dashboard?.busiest_hour || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-[#1E3A8A]">
      Recent Activities
    </h2>

    <p className="text-sm text-gray-500">
      Latest borrower transactions
    </p>
  </div>

  <div className="space-y-3">
    {dashboard?.recent_activities?.length > 0 ? (
      dashboard.recent_activities.map((activity: any) => (
        <div
          key={activity.transaction_id}
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {activity.borrower_name}
            </p>

            <p className="text-xs text-gray-500">
              {activity.type === "LOAN"
                ? "Borrowed"
                : "Paid"}
            </p>
          </div>

          <div className="text-right">
            <p
              className={`text-sm font-bold ${
                activity.type === "LOAN"
                  ? "text-[#1E3A8A]"
                  : "text-[#16A34A]"
              }`}
            >
              {activity.type === "LOAN" ? "+" : "-"}₱
              {Number(activity.amount).toLocaleString()}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(
                activity.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        No recent activities
      </div>
    )}
  </div>
</div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-500 shadow-sm">
          Loading dashboard...
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 ${
        highlight
          ? "bg-[#1E3A8A] text-white"
          : "border border-gray-200 bg-white"
      }`}
    >
      <p
        className={`text-sm ${
          highlight ? "text-blue-100" : "text-gray-500"
        }`}
      >
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}