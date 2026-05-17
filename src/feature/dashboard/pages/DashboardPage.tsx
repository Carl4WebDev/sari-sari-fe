import { useState } from "react";

import AddBorrowerModal from "../modals/AddBorrowerModal";
import AddLoanModal from "../modals/AddLoanModal";
import QuickAddPaymentModal from "../modals/QuickAddPaymentModal";


export default function DashboardPage() {
  const totalUtang = 32450;
  const totalBorrowers = 18;
  const unpaidToday = 4;

  const [isBorrowerOpen, setIsBorrowerOpen] = useState(false);
const [isLoanOpen, setIsLoanOpen] = useState(false);
const [recentBorrower, setRecentBorrower] = useState<any>(null);
const [isQuickPaymentOpen, setIsQuickPaymentOpen] = useState(false);

  const recentUpdates = [
    { type: "LOAN", name: "Juan Dela Cruz", amount: 120, time: "5 mins ago" },
    { type: "PAYMENT", name: "Maria Santos", amount: 200, time: "20 mins ago" },
    { type: "LOAN", name: "Pedro Reyes", amount: 75, time: "1 hr ago" },
  ];

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

      {/* Primary Actions (Mobile Priority) */}
      <div className="space-y-4">
       <button
          onClick={() => setIsBorrowerOpen(true)}
          className="w-full rounded-xl bg-[#1E3A8A] py-4 text-white text-lg font-semibold"
        >
          + Add New Borrower
        </button>
              <button
          onClick={() => setIsLoanOpen(true)}
          className="w-full rounded-xl bg-[#1E3A8A] py-4 text-white text-lg font-semibold"
        >
          + Add Loan
        </button>

        <button
  onClick={() => setIsQuickPaymentOpen(true)}
  className="w-full rounded-lg bg-[#16A34A] py-4 text-white font-semibold"
>
  + Add Payment
</button>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 gap-4">
        <SummaryCard
          title="Total Outstanding Utang"
          value={`₱${totalUtang.toLocaleString()}`}
          highlight
        />
        <SummaryCard
          title="Total Borrowers"
          value={totalBorrowers.toString()}
        />
        <SummaryCard
          title="Unpaid Today"
          value={unpaidToday.toString()}
        />
      </div>

      {/* Recent Updates */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
        <h2 className="mb-4 text-lg font-semibold text-[#1E3A8A]">
          Recent Activity
        </h2>

        <div className="space-y-4">
          {recentUpdates.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.time}
                </p>
              </div>

              <div
                className={`text-sm font-semibold ${
                  item.type === "PAYMENT"
                    ? "text-[#16A34A]"
                    : "text-[#1E3A8A]"
                }`}
              >
                {item.type === "PAYMENT" ? "-" : "+"}₱
                {item.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Section */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
        <h2 className="mb-4 text-lg font-semibold text-[#1E3A8A]">
          Status
        </h2>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Offline Mode</span>
            <span className="font-medium text-[#16A34A]">Online</span>
          </div>

          <div className="flex justify-between">
            <span>Pending Sync</span>
            <span className="font-medium text-gray-800">0</span>
          </div>

          <div className="flex justify-between">
            <span>Active Borrowers</span>
            <span className="font-medium text-gray-800">
              {totalBorrowers}
            </span>
          </div>
        </div>
      </div>
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
          : "bg-white border border-gray-200"
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