import { useEffect, useState, useMemo, useCallback } from "react";
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

import { Link } from "react-router-dom";
import AddBorrowerModal from "../modals/AddBorrowerModal";
import AddLoanModal from "../modals/AddLoanModal";
import QuickAddPaymentModal from "../modals/QuickAddPaymentModal";
import ReminderNotificationModal from "../modals/ReminderNotificationModal";

import { useDashboard } from "../../context/dashboard/useDashboard";
import { useCollectionReminder } from "../../context/collection-reminders/useCollectionReminder";
import { remindAgainApi } from "../../context/collection-reminders/collectionReminderApi";
import { sendCollectionReminderEmail } from "../../../shared/utils/sendEmail";
import GlobalModal from "../../../shared/components/GlobalModal";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import OnboardingWizard from "../../../shared/components/OnboardingWizard";
import TutorialGuide from "../../../shared/components/TutorialGuide";
import { useTutorial } from "../../../shared/hooks/useTutorial";
import { requestPushPermission } from "../../../shared/utils/pushSubscribe";

import CollectionStats from "../components/CollectionStats";
import { useOnlineStatus } from "../../../shared/hooks/useOnlineStatus";
import CollectionCalendar from "../components/CollectionCalendar";
import CalendarDayPanel from "../components/CalendarDayPanel";
import IncomeTab from "../components/IncomeTab";
import AddExpenseModal from "../modals/AddExpenseModal";
import TodayTab from "../components/TodayTab";


export default function DashboardPage() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const {
    dashboard,
    loading,
    fetchDashboard,
    error: dashboardError,
    clearError: clearDashboardError,
    calendarData,
    collectionStats,
    collectionTrend,
    fetchCalendarData,
    fetchCollectionStats,
    fetchCollectionTrend,
    incomeSummary,
    expenses,
    fetchIncomeSummary,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    todayData,
    fetchToday,
  } = useDashboard();

const {
  dashboardReminders,
  fetchDashboardReminders,
  updateReminderStatus,
  error: reminderError,
  clearError: clearReminderError,
} = useCollectionReminder();

  const [isBorrowerOpen, setIsBorrowerOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "overview" | "collections" | "income">("overview");
  const [incomePeriod, setIncomePeriod] = useState<"week" | "month">("month");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [statsPeriod, setStatsPeriod] = useState<"week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDayReminders, setSelectedDayReminders] = useState<any[]>([]);
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] =
    useState(false);

    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

const [globalModal, setGlobalModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
const [overdueDismissed, setOverdueDismissed] = useState(false);

const tutorial = useTutorial(dashboard?.total_borrowers || 0);

useEffect(() => {
  clearDashboardError();
  clearReminderError();
  fetchDashboard();
  fetchToday();
  fetchDashboardReminders();
  requestPushPermission();
}, []);

useEffect(() => {
  if (dashboardError) {
    setGlobalModal({ isOpen: true, title: "Error", message: dashboardError, type: "error" });
  }
}, [dashboardError]);

useEffect(() => {
  if (reminderError) {
    setGlobalModal({ isOpen: true, title: "Error", message: reminderError, type: "error" });
  }
}, [reminderError]);

useEffect(() => {
  if (activeTab === "collections") {
    fetchCalendarData(calendarYear, calendarMonth);
    fetchCollectionStats(statsPeriod);
    fetchCollectionTrend();
  }
}, [activeTab, calendarYear, calendarMonth, statsPeriod]);

useEffect(() => {
  if (activeTab === "income") {
    fetchIncomeSummary(incomePeriod);
    const now = new Date();
    fetchExpenses(now.getMonth() + 1, now.getFullYear());
  }
}, [activeTab, incomePeriod]);

  const chartData = useMemo(() => [
    {
      name: t("dashboard.paid"),
      value: dashboard?.fully_paid || 0,
    },
    {
      name: t("dashboard.unpaid"),
      value: dashboard?.with_balance || 0,
    },
  ], [dashboard]);

  const monthlyUtangTrend = useMemo(() =>
    dashboard?.monthly_utang_trend || []
  , [dashboard]);

  const topBorrowers = useMemo(() =>
    dashboard?.top_borrowers || []
  , [dashboard]);

  const refreshDashboard = useCallback(async () => {
  await fetchDashboard();
  await fetchDashboardReminders();
}, [fetchDashboard, fetchDashboardReminders]);

  return (
    <div className="space-y-6 pb-10">
<AddBorrowerModal
  isOpen={isBorrowerOpen}
  isClose={() => setIsBorrowerOpen(false)}
  onBorrowerCreated={async () => {
    await refreshDashboard();
    tutorial.nextStep(); // step 1 → 2
    setIsLoanOpen(true);
  }}
/>

<AddLoanModal
  isOpen={isLoanOpen}
  isClose={() => setIsLoanOpen(false)}
  onLoanCreated={async () => {
    await refreshDashboard();
    tutorial.completeTutorial();
  }}
  autoOpenProducts={tutorial.isActive}
  onProductSaved={() => {
    if (tutorial.isActive) {
      tutorial.nextStep(); // step 2 → 3
    }
  }}
  mode={tutorial.isActive ? "full" : "quick"}
/>

<QuickAddPaymentModal
  isOpen={isQuickPaymentOpen}
  isClose={() => setIsQuickPaymentOpen(false)}
  onPaymentCreated={refreshDashboard}
/>

<ReminderNotificationModal
  isOpen={isReminderModalOpen}
  isClose={() => setIsReminderModalOpen(false)}
  reminders={dashboardReminders}
  onMarkDone={async (reminderId) => {
    await updateReminderStatus(reminderId, "DONE");
    await fetchDashboardReminders();
  }}
  onRemindAgain={async (reminderId) => {
    await remindAgainApi(reminderId);
    await fetchDashboardReminders();
    setOverdueDismissed(false);
  }}
  onSendEmail={async (reminderId) => {
    const allReminders = [
      ...(dashboardReminders.todays_collections || []),
      ...(dashboardReminders.overdue || []),
      ...(dashboardReminders.upcoming || []),
    ];
    const reminder = allReminders.find((r: any) => r.reminder_id === reminderId);

    if (!reminder?.email) {
      setGlobalModal({ isOpen: true, title: "No Email", message: "This borrower has no email address on file.", type: "warning" });
      return;
    }

    const borrowerName = `${reminder.first_name} ${reminder.last_name}`;
    const ok = await sendCollectionReminderEmail({
      borrowerEmail: reminder.email,
      borrowerName,
      amount: reminder.amount_expected,
      dueDate: reminder.due_date,
      storeName: "Listahub",
    });

    if (ok) {
      setGlobalModal({ isOpen: true, title: "Email Sent", message: `Reminder email sent to ${borrowerName}.`, type: "info" });
    } else {
      setGlobalModal({ isOpen: true, title: "Failed", message: "Could not send email. Please try again.", type: "warning" });
    }
  }}
/>

<AddExpenseModal
  isOpen={isExpenseModalOpen}
  isClose={() => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  }}
  editExpense={editingExpense}
  onSubmit={async (payload) => {
    if (editingExpense) {
      await updateExpense(editingExpense.expense_id, payload);
    } else {
      await createExpense(payload);
    }
    fetchIncomeSummary(incomePeriod);
  }}
/>

      {/* Tutorial Guide — floating card for new users */}
      <TutorialGuide
        visible={
          tutorial.isActive && (
            (tutorial.currentStep === 1 && !isBorrowerOpen && !isLoanOpen) ||
            (tutorial.currentStep === 3 && isLoanOpen)
          )
        }
        step={tutorial.currentStep}
        onAction={() => {
          if (tutorial.currentStep === 1) {
            setIsBorrowerOpen(true);
          }
          // step 3: "Got it" just dismisses the guide, user completes the loan
        }}
        onSkip={tutorial.skipTutorial}
      />

      {/* Onboarding Wizard — show when no borrowers (hidden during tutorial) */}
      {!loading && dashboard && (dashboard.total_borrowers || 0) === 0 && !tutorial.isActive && (
        <OnboardingWizard
          borrowerCount={0}
          onAddBorrower={() => setIsBorrowerOpen(true)}
          onAddLoan={() => setIsLoanOpen(true)}
        />
      )}

      {/* Header */}
<div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-semibold text-[#1E3A8A]">
      {t("dashboard.title")}
    </h1>
    <p className="text-sm text-gray-500">{t("dashboard.subtitle")}</p>
  </div>

  <div className="flex items-center gap-2">
    <button
      onClick={async () => {
        if (!dashboard) return;
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const { generateDashboardPDF } = await import("../../../shared/utils/exportToPDF");
        generateDashboardPDF(dashboard, user.store_name || "");
      }}
      className="rounded-xl border border-[#1E3A8A] bg-white px-3 py-3 text-sm text-[#1E3A8A] shadow-sm"
      title={t("common.export_pdf")}
    >
      📕
    </button>

    <button
      onClick={() => setIsReminderModalOpen(true)}
    className="relative rounded-xl border border-[#1E3A8A] bg-white px-4 py-3 text-sm font-semibold text-[#1E3A8A] shadow-sm"
  >
    🔔
    {((dashboardReminders?.todays_collections?.length || 0) +
      (dashboardReminders?.overdue?.length || 0)) > 0 && (
      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
        {(dashboardReminders?.todays_collections?.length || 0) +
          (dashboardReminders?.overdue?.length || 0)}
      </span>
    )}
  </button>
  </div>
</div>

      {/* Overdue Summary Banner */}
      {!overdueDismissed && (dashboardReminders?.overdue?.length || 0) > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-800">
              {dashboardReminders.overdue.length} overdue collection{dashboardReminders.overdue.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Total: ₱{dashboardReminders.overdue.reduce((sum: number, r: any) => sum + Number(r.amount_expected || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
              View
            </button>
            <button
              onClick={() => setOverdueDismissed(true)}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {isOnline && (
        <button
          onClick={() => setIsBorrowerOpen(true)}
          className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white"
        >
          + {t("dashboard.add_borrower")}
        </button>
        )}

        <button
          onClick={() => setIsLoanOpen(true)}
          className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-semibold text-white"
        >
          + {t("dashboard.add_loan")}
        </button>

        <button
          onClick={() => setIsQuickPaymentOpen(true)}
          className="w-full rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white"
        >
          + {t("dashboard.add_payment")}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "today"
              ? "bg-[#1E3A8A] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.tab_today")}
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "bg-[#1E3A8A] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.tab_overview")}
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "collections"
              ? "bg-[#1E3A8A] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.tab_collections")}
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "income"
              ? "bg-[#1E3A8A] text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.tab_income")}
        </button>
      </div>

      {/* Today Tab */}
      {activeTab === "today" && (
        <TodayTab
          summary={todayData?.summary || null}
          transactions={todayData?.transactions || []}
        />
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (<>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title={t("dashboard.total_utang")}
          value={`₱${Number(
            dashboard?.total_utang || 0
          ).toLocaleString()}`}
          highlight
        />

        <SummaryCard
          title={t("dashboard.total_borrowers")}
          value={String(
            dashboard?.total_borrowers || 0
          )}
        />

        <SummaryCard
          title={t("dashboard.new_today")}
          value={String(
            dashboard?.new_borrowers_today || 0
          )}
        />

        <SummaryCard
          title={t("dashboard.new_month")}
          value={String(
            dashboard?.new_borrowers_this_month || 0
          )}
        />
      </div>

      {/* Analytics */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">
            {t("dashboard.analytics")}
          </h2>

          <p className="text-sm text-gray-500">
            {t("dashboard.analytics_subtitle")}
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-500">
  {t("dashboard.analytics_desc")}
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
      {t("dashboard.monthly_trend")}
    </h2>

    <p className="text-sm text-gray-500">
      {t("dashboard.monthly_trend_subtitle")}
    </p>
    <p className="mt-2 text-xs leading-5 text-gray-500">
  {t("dashboard.monthly_trend_desc")}
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
        {t("dashboard.no_trend")}
      </div>
    )}
  </div>
</div>
{/* Top Borrowers */}
<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-[#1E3A8A]">
      {t("dashboard.top_borrowers")}
    </h2>

    <p className="text-sm text-gray-500">
      {t("dashboard.top_borrowers_subtitle")}
    </p>

    <p className="mt-2 text-xs leading-5 text-gray-500">
      {t("dashboard.top_borrowers_desc")}
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
<Link
  to={`/borrowers/${borrower.borrower_id}`}
  className="group block rounded-xl px-2 py-1 transition hover:bg-blue-50"
>
  <div>
    <p className="text-sm font-semibold text-gray-800 transition group-hover:text-[#1E3A8A]">
      {borrower.name}
    </p>

    <p className="text-xs text-gray-500">
      {t("dashboard.high_balance")}
    </p>
  </div>
</Link>
          </div>

          <p className="text-sm font-bold text-red-500">
            ₱{Number(borrower.balance).toLocaleString()}
          </p>
        </div>
      ))
    ) : ( 
      <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        {t("dashboard.no_unpaid")}
      </div>
    )}
  </div>
</div>


      {/* Insights */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1E3A8A]">
          {t("dashboard.insights")}
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              {t("dashboard.fully_paid_insight")}
            </span>

            <span className="font-semibold text-[#16A34A]">
              {dashboard?.fully_paid || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              {t("dashboard.with_balance_insight")}
            </span>

            <span className="font-semibold text-red-500">
              {dashboard?.with_balance || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              {t("dashboard.busiest_day")}
            </span>

            <span className="font-semibold text-gray-800">
              {dashboard?.busiest_day || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              {t("dashboard.busiest_hour")}
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
      {t("dashboard.recent_activities")}
    </h2>

    <p className="text-sm text-gray-500">
      {t("dashboard.recent_activities_subtitle")}
    </p>
  </div>

  <div className="space-y-3">
    {dashboard?.recent_activities?.length > 0 ? (
      dashboard.recent_activities.map((activity: any) => (
        <div
          key={activity.transaction_id}
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
        >
<Link
  to={`/borrowers/${activity.borrower_id}`}
  className="group block rounded-xl px-2 py-1 transition hover:bg-blue-50"
>
  <div>
    <p className="text-sm font-semibold text-gray-800 transition group-hover:text-[#1E3A8A]">
      {activity.borrower_name}
    </p>

    <p className="text-xs text-gray-500">
      {activity.type === "LOAN"
        ? t("dashboard.borrowed")
        : t("dashboard.paid_label")}
    </p>
  </div>
</Link>

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

            <p className="text-xs text-gray-500">
              {new Date(
                activity.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        {t("dashboard.no_activities")}
      </div>
    )}
  </div>
</div>
      </>)}

      {/* Collections Tab */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          <CollectionStats
            stats={collectionStats}
            trend={collectionTrend}
            period={statsPeriod}
            onPeriodChange={setStatsPeriod}
          />
          <CollectionCalendar
            calendarData={calendarData}
            year={calendarYear}
            month={calendarMonth}
            onPrevMonth={() => {
              if (calendarMonth === 1) {
                setCalendarYear(calendarYear - 1);
                setCalendarMonth(12);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
            onNextMonth={() => {
              if (calendarMonth === 12) {
                setCalendarYear(calendarYear + 1);
                setCalendarMonth(1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
            onDayClick={(date, reminders) => {
              setSelectedDay(date);
              setSelectedDayReminders(reminders);
            }}
          />
        </div>
      )}

      {/* Income Tab */}
      {activeTab === "income" && (
        <IncomeTab
          summary={incomeSummary}
          expenses={expenses}
          period={incomePeriod}
          onPeriodChange={setIncomePeriod}
          onAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onEditExpense={(expense) => {
            setEditingExpense(expense);
            setIsExpenseModalOpen(true);
          }}
          onDeleteExpense={async (id) => {
            await deleteExpense(id);
            fetchIncomeSummary(incomePeriod);
          }}
        />
      )}

      {/* Calendar Day Panel */}
      <CalendarDayPanel
        isOpen={selectedDay !== null}
        date={selectedDay || ""}
        reminders={selectedDayReminders}
        onClose={() => {
          setSelectedDay(null);
          setSelectedDayReminders([]);
        }}
        onMarkDone={async (reminderId) => {
          await updateReminderStatus(reminderId, "DONE");
          await fetchDashboardReminders();
          // Refresh calendar data
          fetchCalendarData(calendarYear, calendarMonth);
          fetchCollectionStats(statsPeriod);
          setSelectedDayReminders((prev) =>
            prev.map((r) =>
              r.reminder_id === reminderId ? { ...r, status: "DONE" } : r,
            ),
          );
        }}
      />

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-500 shadow-sm">
          {t("dashboard.title")}...
        </div>
      )}

      <GlobalModal
        isOpen={globalModal.isOpen}
        title={globalModal.title}
        message={globalModal.message}
        type={globalModal.type as any}
        onClose={() => {
          setGlobalModal({
            ...globalModal,
            isOpen: false,
          });
          clearDashboardError();
          clearReminderError();
        }}
      />
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

