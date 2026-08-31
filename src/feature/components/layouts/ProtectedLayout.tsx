import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import ConnectionStatus from "../../../shared/components/ConnectionStatus";
import QuickActionFab from "../../../shared/components/QuickActionFab";
import AddLoanModal from "../../dashboard/modals/AddLoanModal";
import QuickAddPaymentModal from "../../dashboard/modals/QuickAddPaymentModal";
import SuccessToast from "../../../shared/components/SuccessToast";
import SubscriptionModal from "../../subscription/components/SubscriptionModal";
import { useDashboard } from "../../context/dashboard/useDashboard";
import { useBorrower } from "../../context/borrowers/useBorrower";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCollectionReminder } from "../../context/collection-reminders/useCollectionReminder";

import AuthModal from "../../auth/modals/AuthModal";

export default function ProtectedLayout() {
  const token = localStorage.getItem("user_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <ProtectedLayoutInner />;
}

function ProtectedLayoutInner() {
  const navigate = useNavigate();
  const { fetchDashboard, fetchToday } = useDashboard();
  const { fetchBorrowers } = useBorrower();
  const { dashboardReminders } = useCollectionReminder();

  const dueCount =
    (dashboardReminders?.todays_collections?.length || 0) +
    (dashboardReminders?.overdue?.length || 0);

  const isDemo = localStorage.getItem("is_demo_mode") === "true";

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isQuickLoanOpen, setIsQuickLoanOpen] = useState(false);
  const [isQuickPaymentOpen, setIsQuickPaymentOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [toastData, setToastData] = useState<{
    isOpen: boolean;
    amount: number;
    borrowerName: string;
    newBalance: number;
  }>({ isOpen: false, amount: 0, borrowerName: "", newBalance: 0 });

  const isAnyModalOpen = isQuickLoanOpen || isQuickPaymentOpen || isSubscriptionOpen;

  const handleRefresh = async () => {
    await fetchDashboard();
    await fetchToday();
    await fetchBorrowers();
  };

  const handleExitDemo = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("is_demo_mode");
    localStorage.removeItem("user");
    localStorage.removeItem("demo_store_data");
    navigate("/");
  };

  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fil" : "en");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-900 selection:text-white">
      <Sidebar 
        isOpenExternal={isSidebarOpen} 
        onCloseExternal={() => setIsSidebarOpen(false)} 
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || "login");
          setIsAuthOpen(true);
        }}
      />

      {/* Main App Content Wrapper shifted by Sidebar on desktop */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarOpen ? "lg:pl-72" : "lg:pl-0"
      }`}>
        {/* Fixed Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-6 lg:px-8 py-3 shadow-md border-b border-slate-800 w-full transition-all duration-300">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white transition cursor-pointer flex items-center justify-center border border-slate-700/80 active:scale-95 shrink-0"
                  title="Show Sidebar"
                >
                  <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Listahub Brand Icon & Title */}
              <div
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition shrink-0"
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-xs border border-blue-700 shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black text-white tracking-tight leading-none block">Listahub</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Live Collection Dues Quick Pill (Navbar) */}
              {dueCount > 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard?tab=collections")}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-black px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-2xs border border-rose-400/40 flex items-center gap-1.5 cursor-pointer transition active:scale-95 whitespace-nowrap shrink-0"
                  title={`${dueCount} Collection Reminders Due`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span>{dueCount} Dues</span>
                </button>
              )}

              {/* Premium Interactive Button in Navbar */}
              <button
                onClick={() => setIsSubscriptionOpen(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-2xs border border-amber-400/40 flex items-center gap-1.5 cursor-pointer transition active:scale-95 whitespace-nowrap shrink-0"
                title="Listahub Subscription Plans"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
                <span>{t("nav.premium")}</span>
              </button>

              {/* Language Switcher Pill */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                title="Switch Language"
              >
                <span className={language === "en" ? "text-blue-400 font-extrabold" : "text-slate-400 font-bold"}>EN</span>
                <span className="text-slate-600">|</span>
                <span className={language === "fil" ? "text-blue-400 font-extrabold" : "text-slate-400 font-bold"}>FIL</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Responsive Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-7xl mx-auto w-full space-y-4">
          <ConnectionStatus />
          <Outlet />
        </main>
      </div>

      <QuickActionFab
        onQuickLoan={() => setIsQuickLoanOpen(true)}
        onQuickPayment={() => setIsQuickPaymentOpen(true)}
        isAnyModalOpen={isAnyModalOpen || isSidebarOpen}
        hidden={isAnyModalOpen || isSidebarOpen}
      />

      <AddLoanModal
        isOpen={isQuickLoanOpen}
        onClose={() => setIsQuickLoanOpen(false)}
        onSuccess={handleRefresh}
      />

      <QuickAddPaymentModal
        isOpen={isQuickPaymentOpen}
        onClose={() => setIsQuickPaymentOpen(false)}
        onSuccess={(data) => {
          setToastData({
            isOpen: true,
            amount: data.amount,
            borrowerName: data.borrowerName,
            newBalance: data.newBalance,
          });
          handleRefresh();
        }}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />

      <SuccessToast
        isOpen={toastData.isOpen}
        amount={toastData.amount}
        borrowerName={toastData.borrowerName}
        newBalance={toastData.newBalance}
        onClose={() => setToastData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
