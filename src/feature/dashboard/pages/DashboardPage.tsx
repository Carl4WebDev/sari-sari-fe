import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  YAxis,
} from "recharts";

import { Link, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
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

  useEffect(() => {
    if (urlTab && ["today", "overview", "collections", "income"].includes(urlTab)) {
      setActiveTab(urlTab as any);
    }
  }, [urlTab]);

  const handleTabSwitch = (tab: "today" | "overview" | "collections" | "income") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const overdueReminders = dashboardReminders?.overdue || [];
  const todayReminders = dashboardReminders?.todays_collections || [];
  const totalDueCount = overdueReminders.length + todayReminders.length;
  const totalDueAmount = [...overdueReminders, ...todayReminders].reduce(
    (sum: number, r: any) => sum + (Number(r.amount_expected) || 0),
    0
  );

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
  fetchCalendarData(calendarYear, calendarMonth);
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
  if (activeTab === "today") {
    fetchToday();
  } else if (activeTab === "collections") {
    fetchCalendarData(calendarYear, calendarMonth);
    fetchCollectionStats(statsPeriod);
    fetchCollectionTrend();
  } else if (activeTab === "income") {
    fetchIncomeSummary(incomePeriod);
    const now = new Date();
    fetchExpenses(now.getMonth() + 1, now.getFullYear());
  }
}, [activeTab, calendarYear, calendarMonth, statsPeriod, incomePeriod]);

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

      {/* Dashboard Header */}
      <div className="flex items-center justify-between gap-4 pt-1 flex-wrap sm:flex-nowrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {t("dashboard.title")}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Store
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Export to PDF Button */}
          <button
            type="button"
            onClick={async () => {
              if (!dashboard) return;
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              const { generateDashboardPDF } = await import("../../../shared/utils/exportToPDF");
              generateDashboardPDF(dashboard, user.store_name || "");
            }}
            className="rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-3.5 py-2.5 shadow-2xs transition active:scale-95 flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-black"
            title={t("common.export_pdf")}
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">{t("common.export_pdf")}</span>
          </button>

          {/* Quick Reminders Bell Button */}
          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className="relative rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-3.5 py-2.5 shadow-2xs transition active:scale-95 flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-black"
            title="Collection Reminders"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden sm:inline">Reminders</span>
            {totalDueCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black shadow-2xs animate-pulse">
                {totalDueCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3-Column Premium Gradient Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
        {isOnline && (
          <button
            type="button"
            onClick={() => setIsBorrowerOpen(true)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-4 sm:p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-blue-400/30 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                  Borrower
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 font-semibold mt-0.5">
                  Manage borrowers
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsLoanOpen(true)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 sm:p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-indigo-400/30 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                Loan
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 font-semibold mt-0.5">
                Create a new loan
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setIsQuickPaymentOpen(true)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 p-4 sm:p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/30 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                Payment
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-semibold mt-0.5">
                Record a payment
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tab Bar (Modern Dark Glassmorphic Pill Track) */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 rounded-3xl bg-slate-200/70 p-1.5 border border-slate-200/90 shadow-2xs w-full min-w-0">
        <button
          type="button"
          onClick={() => handleTabSwitch("today")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "today"
              ? "bg-slate-900 text-white shadow-sm scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          {t("dashboard.tab_today")}
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("overview")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-sm scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          {t("dashboard.tab_overview")}
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("collections")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
            activeTab === "collections"
              ? "bg-slate-900 text-white shadow-sm scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <span>{t("dashboard.tab_collections")}</span>
          {totalDueCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-2xs">
              {totalDueCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("income")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "income"
              ? "bg-slate-900 text-white shadow-sm scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
      {/* 4-Column Responsive Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
        {/* Total Utang Hero Navy Card */}
        <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t("dashboard.total_utang")}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight truncate">
              ₱{Number(dashboard?.total_utang || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <span className="truncate">Total outstanding balance</span>
            </div>
          </div>
        </div>

        {/* Total Borrowers White Card */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t("dashboard.total_borrowers")}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {dashboard?.total_borrowers || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-500">Active borrowers</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200/60 shrink-0">
                ↑ 12%
              </span>
            </div>
          </div>
        </div>

        {/* New Today White Card */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t("dashboard.new_today")}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {dashboard?.new_borrowers_today || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-500">Registered today</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold shrink-0">
                0 yesterday
              </span>
            </div>
          </div>
        </div>

        {/* New This Month White Card */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {t("dashboard.new_month")}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {dashboard?.new_borrowers_this_month || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-500">Joined this month</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold shrink-0">
                0 last mo.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Analytics & Monthly Trend (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        {/* Analytics Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                  {t("dashboard.analytics")}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {t("dashboard.analytics_subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200/70 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{dashboard?.fully_paid || 0}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-black border border-rose-200/70 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>{dashboard?.with_balance || 0}</span>
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            {(dashboard?.fully_paid || 0) === 0 && (dashboard?.with_balance || 0) === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-6 text-center space-y-2 border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <p className="text-xs font-black text-slate-900">No Analytics Yet</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-xs">
                  Borrower payment health distributions will appear here as transactions occur.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
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
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : "#F43F5E"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Utang Trend Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                  {t("dashboard.monthly_trend")}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {t("dashboard.monthly_trend_subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            {monthlyUtangTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyUtangTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utangTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748B", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
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
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#utangTrendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-6 text-center space-y-2 border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-xs font-black text-slate-900">{t("dashboard.no_trend")}</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-xs">
                  Tracks total loan activity monthly to visualize borrowing volume over time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Top Borrowers & Recent Activities (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        {/* Top Borrowers Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                  {t("dashboard.top_borrowers")}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {t("dashboard.top_borrowers_subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {topBorrowers.length > 0 ? (
              topBorrowers.map((borrower: any, index: number) => (
                <div
                  key={borrower.borrower_id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-xs font-black text-white shadow-xs">
                      {index + 1}
                    </div>
                    <Link
                      to={`/borrowers/${borrower.borrower_id}`}
                      className="group block"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-black text-slate-900 transition group-hover:text-blue-600">
                          {borrower.name}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {t("dashboard.high_balance")}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm font-black text-rose-600">
                    ₱{Number(borrower.balance).toLocaleString()}
                  </p>
                </div>
              ))
            ) : ( 
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-6 text-center space-y-2 border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-black text-slate-900">{t("dashboard.no_unpaid")}</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-xs">
                  Borrowers with highest outstanding balances will be ranked here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                  {t("dashboard.recent_activities")}
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {t("dashboard.recent_activities_subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {dashboard?.recent_activities?.length > 0 ? (
              dashboard.recent_activities.map((activity: any) => {
                const isLoan = activity.type === "LOAN";
                return (
                  <div
                    key={activity.transaction_id || activity.activity_id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-slate-100/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isLoan ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}
                      >
                        {isLoan ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <Link
                        to={`/borrowers/${activity.borrower_id}`}
                        className="group block"
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-black text-slate-900 transition group-hover:text-blue-600">
                            {activity.borrower_name}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            {isLoan ? t("dashboard.borrowed") : t("dashboard.paid_label")}
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs sm:text-sm font-black ${
                          isLoan ? "text-slate-950" : "text-emerald-600"
                        }`}
                      >
                        {isLoan ? "+" : "-"}₱{Number(activity.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/60 p-6 text-center space-y-2 border border-dashed border-slate-200">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-black text-slate-900">{t("dashboard.no_activities")}</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-xs">
                  Today's loans and payment records will show here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Insights Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
            {t("dashboard.insights")}
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Overview of store payment health and peak activity times
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-black text-slate-700">
                {t("dashboard.fully_paid_insight")}
              </span>
            </div>
            <span className="text-lg font-black text-emerald-700">
              {dashboard?.fully_paid || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-black text-slate-700">
                {t("dashboard.with_balance_insight")}
              </span>
            </div>
            <span className="text-lg font-black text-rose-600">
              {dashboard?.with_balance || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-black text-slate-700">
                {t("dashboard.busiest_day")}
              </span>
            </div>
            <span className="text-sm font-black text-slate-950">
              {dashboard?.busiest_day || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-black text-slate-700">
                {t("dashboard.busiest_hour")}
              </span>
            </div>
            <span className="text-sm font-black text-slate-950">
              {dashboard?.busiest_hour || "-"}
            </span>
          </div>
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

