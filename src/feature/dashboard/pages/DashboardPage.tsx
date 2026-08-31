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
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">{t("dashboard.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!dashboard) return;
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              const { generateDashboardPDF } = await import("../../../shared/utils/exportToPDF");
              generateDashboardPDF(dashboard, user.store_name || "");
            }}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition cursor-pointer"
            title={t("common.export_pdf")}
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="relative p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {((dashboardReminders?.todays_collections?.length || 0) +
              (dashboardReminders?.overdue?.length || 0)) > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {(dashboardReminders?.todays_collections?.length || 0) +
                  (dashboardReminders?.overdue?.length || 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overdue Summary Banner */}
      {!overdueDismissed && (dashboardReminders?.overdue?.length || 0) > 0 && (
        <div className="rounded-3xl bg-rose-50 border border-rose-200 p-4 md:p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-rose-900">
              {dashboardReminders.overdue.length} overdue collection{dashboardReminders.overdue.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs font-semibold text-rose-700 mt-0.5">
              Total: ₱{dashboardReminders.overdue.reduce((sum: number, r: any) => sum + Number(r.amount_expected || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-2xs"
            >
              View
            </button>
            <button
              onClick={() => setOverdueDismissed(true)}
              className="rounded-xl border border-rose-300 hover:bg-rose-100/50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Premium Action Cards matching user screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {isOnline && (
          <button
            onClick={() => setIsBorrowerOpen(true)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-4 sm:p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-blue-400/30 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-xs group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight leading-tight">Borrower</h3>
                <p className="text-xs text-blue-100 font-medium mt-0.5">Manage borrowers</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <button
          onClick={() => setIsLoanOpen(true)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 sm:p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-indigo-400/30 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-xs group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">Loan</h3>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">Create a new loan</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => setIsQuickPaymentOpen(true)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 p-4 sm:p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/30 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-xs group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">Payment</h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">Record a payment</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tab Bar (Modern Dark Glassmorphic Pill Track) */}
      <div className="flex overflow-x-auto no-scrollbar gap-1 rounded-3xl bg-slate-200/60 p-1.5 border border-slate-200/90 shadow-2xs w-full min-w-0">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "today"
              ? "bg-slate-950 text-white shadow-md scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          {t("dashboard.tab_today")}
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "overview"
              ? "bg-slate-950 text-white shadow-md scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          {t("dashboard.tab_overview")}
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "collections"
              ? "bg-slate-950 text-white shadow-md scale-100"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          {t("dashboard.tab_collections")}
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 min-w-0 rounded-2xl py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
            activeTab === "income"
              ? "bg-slate-950 text-white shadow-md scale-100"
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
      {/* 4-Column Responsive Summary Cards Grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Utang Dark Navy Card */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-800 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("dashboard.total_utang")}</span>
            <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
              ₱{Number(dashboard?.total_utang || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Total outstanding balance</p>
          </div>
        </div>

        {/* Total Borrowers White Card */}
        <div className="p-5 md:p-6 rounded-3xl bg-white text-slate-900 shadow-2xs border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("dashboard.total_borrowers")}</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {dashboard?.total_borrowers || 0}
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500 font-medium">Active borrowers</span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">↑ 12% from last month</span>
            </div>
          </div>
        </div>

        {/* New Today White Card */}
        <div className="p-5 md:p-6 rounded-3xl bg-white text-slate-900 shadow-2xs border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("dashboard.new_today")}</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {dashboard?.new_borrowers_today || 0}
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500 font-medium">New borrowers today</span>
              <span className="text-slate-400 font-extrabold flex items-center gap-0.5">- 0% from yesterday</span>
            </div>
          </div>
        </div>

        {/* New This Month White Card */}
        <div className="p-5 md:p-6 rounded-3xl bg-white text-slate-900 shadow-2xs border border-slate-200/90 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("dashboard.new_month")}</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {dashboard?.new_borrowers_this_month || 0}
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500 font-medium">New borrowers this month</span>
              <span className="text-slate-400 font-extrabold flex items-center gap-0.5">- 0% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t("dashboard.analytics")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {t("dashboard.analytics_subtitle")}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {t("dashboard.analytics_desc")}
          </p>
        </div>

        <div className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }} axisLine={false} tickLine={false} />
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
              <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Utang Trend Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t("dashboard.monthly_trend")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {t("dashboard.monthly_trend_subtitle")}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {t("dashboard.monthly_trend_desc")}
          </p>
        </div>

        <div className="h-64 pt-2">
          {monthlyUtangTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyUtangTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }} axisLine={false} tickLine={false} />
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50/80 p-6 text-xs sm:text-sm font-semibold text-slate-400">
              {t("dashboard.no_trend")}
            </div>
          )}
        </div>
      </div>

      {/* Top Borrowers Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t("dashboard.top_borrowers")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {t("dashboard.top_borrowers_subtitle")}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {t("dashboard.top_borrowers_desc")}
          </p>
        </div>

        <div className="space-y-2.5">
          {topBorrowers.length > 0 ? (
            topBorrowers.map((borrower: any, index: number) => (
              <div
                key={borrower.borrower_id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white shadow-xs">
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

                <p className="text-xs sm:text-sm font-black text-rose-500">
                  ₱{Number(borrower.balance).toLocaleString()}
                </p>
              </div>
            ))
          ) : ( 
            <div className="rounded-2xl bg-slate-50/80 p-6 text-center text-xs sm:text-sm font-semibold text-slate-400">
              {t("dashboard.no_unpaid")}
            </div>
          )}
        </div>
      </div>

      {/* Insights Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {t("dashboard.insights")}
        </h2>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-extrabold text-slate-600">
              {t("dashboard.fully_paid_insight")}
            </span>
            <span className="font-black text-emerald-600">
              {dashboard?.fully_paid || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-extrabold text-slate-600">
              {t("dashboard.with_balance_insight")}
            </span>
            <span className="font-black text-rose-500">
              {dashboard?.with_balance || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-extrabold text-slate-600">
              {t("dashboard.busiest_day")}
            </span>
            <span className="font-black text-slate-900">
              {dashboard?.busiest_day || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-extrabold text-slate-600">
              {t("dashboard.busiest_hour")}
            </span>
            <span className="font-black text-slate-900">
              {dashboard?.busiest_hour || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activities Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t("dashboard.recent_activities")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {t("dashboard.recent_activities_subtitle")}
          </p>
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
                        isLoan ? "bg-emerald-100/70 text-emerald-700" : "bg-blue-100/70 text-blue-700"
                      }`}
                    >
                      {isLoan ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        isLoan ? "text-slate-900" : "text-emerald-600"
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
            <div className="rounded-2xl bg-slate-50/80 p-6 text-center text-xs sm:text-sm font-semibold text-slate-400">
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

