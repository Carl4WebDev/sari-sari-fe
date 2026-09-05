import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";

import AuthModal from "../../auth/modals/AuthModal";
import SubscriptionModal from "../../subscription/components/SubscriptionModal";

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("register");

  // Subscription Modal State
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Interactive Demo Calculator State
  const [borrowerCount, setBorrowerCount] = useState(15);
  const [avgUtang, setAvgUtang] = useState(350);

  // Preview tab state
  const [activeTab, setActiveTab] = useState<"borrowers" | "analytics" | "receipt">("borrowers");

  const totalUncollected = borrowerCount * avgUtang;
  const estimatedSavedTime = Math.round(borrowerCount * 0.5);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fil" : "en");
  };

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode("register");
    setAuthModalOpen(true);
  };

  const handleGetStarted = () => {
    localStorage.setItem("user_token", "active_store_token");
    localStorage.setItem("is_demo_mode", "true");
    localStorage.setItem("user", JSON.stringify({
      id: 1,
      email: "owner@listahub.ph",
      store_name: "Ang Akong Tindahan",
      name: "Store Owner",
    }));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-900 selection:text-white">
      {/* Header / Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 py-2.5 sm:py-4 flex items-center justify-between gap-2 overflow-x-hidden">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => navigate("/")}>
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30 transition hover:scale-105 shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 tracking-tight leading-none block">Listahub</span>
              <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5 block">Utang Tracker</span>
            </div>
          </div>

          {/* Action Buttons in Navbar */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-black rounded-2xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200/90 transition cursor-pointer shadow-2xs whitespace-nowrap"
              title="Switch Language"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className={language === "en" ? "text-slate-950 font-black" : "text-slate-400 font-bold"}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={language === "fil" ? "text-slate-950 font-black" : "text-slate-400 font-bold"}>FIL</span>
            </button>

            {/* Log In Button */}
            <button
              onClick={handleOpenLogin}
              className="px-3 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-black text-slate-800 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 rounded-2xl border border-slate-200/90 transition active:scale-95 whitespace-nowrap cursor-pointer"
            >
              {t("auth.login")}
            </button>

            {/* Register / Get Started Button */}
            <button
              onClick={handleOpenRegister}
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-600/25 transition active:scale-95 whitespace-nowrap cursor-pointer"
            >
              {t("landing.get_started")}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-12 space-y-8 sm:space-y-12">
        {/* Hero Banner */}
        <div className="text-center pt-2 sm:pt-4 max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
            {t("landing.hero_title_1")}{" "}
            <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
              {t("landing.hero_title_2")}
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-semibold max-w-2xl mx-auto">
            {t("landing.hero_subtitle")}
          </p>

          {/* Quick Actions (Register, Log In, and Demo) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full">
            <button
              onClick={handleOpenRegister}
              className="w-full sm:flex-1 py-3.5 sm:py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base rounded-3xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center text-center cursor-pointer whitespace-nowrap"
            >
              <span>{t("landing.get_started_now")}</span>
            </button>
            <button
              onClick={handleOpenLogin}
              className="w-full sm:w-auto py-3.5 sm:py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 font-black text-sm sm:text-base rounded-3xl shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center text-center cursor-pointer whitespace-nowrap"
            >
              <span>{t("auth.login")}</span>
            </button>
          </div>
          <div className="pt-1">
            <button
              onClick={handleGetStarted}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer underline underline-offset-4"
            >
              ⚡ Or try instant Demo Sandbox without account
            </button>
          </div>
        </div>

        {/* Responsive Widescreen Grid: App Showcase & Store Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* App Showcase Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-full">
            <div className="bg-slate-950 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-xs font-black gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-[11px] sm:text-xs">{t("landing.interactive_preview")}</span>
              </div>
              <Link to="/demo" className="text-[11px] sm:text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-black transition whitespace-nowrap shrink-0">
                LAUNCH DEMO →
              </Link>
            </div>

            {/* Tabs */}
            <div className="bg-slate-100/80 p-2 flex gap-1.5 border-b border-slate-200/80">
              <button
                onClick={() => setActiveTab("borrowers")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === "borrowers" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{t("borrowers.title")}</span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === "analytics" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>{t("dashboard.analytics")}</span>
              </button>

              <button
                onClick={() => setActiveTab("receipt")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === "receipt" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Receipt</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 text-xs min-h-[250px] flex-1 flex flex-col justify-center">
              {activeTab === "borrowers" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-black text-slate-900">{t("landing.active_borrowers")}</span>
                    <span className="text-rose-600 font-black">{t("dashboard.total_utang")}: ₱1,170</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-900 font-black flex items-center justify-center text-xs">
                        JC
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-xs">Juan Cruz</div>
                        <div className="text-[10px] font-medium text-slate-400">0917-123-4567</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-rose-600 text-xs">₱ 350.00</div>
                      <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-black">
                        {t("dashboard.unpaid")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                        MS
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-xs">Maria Santos</div>
                        <div className="text-[10px] font-medium text-slate-400">{t("borrowers.fully_paid")}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-600 text-xs">₱ 0.00</div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-black">
                        {t("dashboard.paid")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="py-2 text-center space-y-3">
                  <div className="font-black text-slate-900 text-sm">{t("landing.monthly_trend")}</div>
                  <div className="h-32 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-end justify-around gap-2">
                    <div className="w-1/5 bg-blue-100 h-[40%] rounded-t-lg text-[10px] flex items-end justify-center pb-1 text-slate-600 font-black">Jan</div>
                    <div className="w-1/5 bg-blue-200 h-[60%] rounded-t-lg text-[10px] flex items-end justify-center pb-1 text-slate-700 font-black">Feb</div>
                    <div className="w-1/5 bg-blue-300 h-[50%] rounded-t-lg text-[10px] flex items-end justify-center pb-1 text-slate-800 font-black">Mar</div>
                    <div className="w-1/5 bg-blue-500 h-[80%] rounded-t-lg text-[10px] flex items-end justify-center pb-1 text-white font-black">Apr</div>
                    <div className="w-1/5 bg-blue-900 h-[100%] rounded-t-lg text-[10px] flex items-end justify-center pb-1 text-white font-black">May</div>
                  </div>
                </div>
              )}

              {activeTab === "receipt" && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                  <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{t("landing.digital_receipt_statement")}</div>
                  <div className="font-black text-slate-900 text-sm">{t("landing.statement_of_account")}</div>
                  <div className="text-xs text-slate-500 font-bold">{t("landing.customer")}: Juan Cruz</div>

                  <div className="bg-white p-3.5 rounded-xl text-left text-xs space-y-2 border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">{t("dashboard.total_utang")}:</span>
                      <span className="font-black text-slate-900">₱ 500.00</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-black">
                      <span>{t("landing.total_paid")}:</span>
                      <span>- ₱ 150.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-rose-600 text-sm">
                      <span>{t("landing.balance")}:</span>
                      <span>₱ 350.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Store Calculator Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-center gap-2 text-slate-950 font-black text-base border-b border-slate-100 pb-4">
              <svg className="w-5 h-5 text-blue-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{t("landing.store_calculator")}</span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-black text-slate-900 mb-2">
                  <span>{t("landing.borrowers_count")}:</span>
                  <span className="text-blue-900 font-black text-base">{borrowerCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="100"
                  value={borrowerCount}
                  onChange={(e) => setBorrowerCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-black text-slate-900 mb-2">
                  <span>{t("landing.average_utang")}:</span>
                  <span className="text-blue-900 font-black text-base">₱ {avgUtang}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={avgUtang}
                  onChange={(e) => setAvgUtang(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>
            </div>

            <div className="bg-slate-950 text-white p-6 rounded-3xl text-center space-y-2 border border-slate-800 shadow-xl">
              <div className="text-xs uppercase tracking-wider text-blue-400 font-black">{t("landing.estimated_uncollected")}</div>
              <div className="text-3xl font-black text-amber-400">₱ {totalUncollected.toLocaleString()}</div>
              <div className="text-xs text-slate-400 font-semibold">{t("landing.time_saved")}: {estimatedSavedTime * 4} {t("landing.hours_month")}</div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (3 Columns on Widescreen) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-950 mb-1">{t("landing.digital_receipts_title")}</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{t("landing.digital_receipts_desc")}</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M1.414 8.414a15 15 0 0121.172 0" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-950 mb-1">{t("landing.offline_first_title")}</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{t("landing.offline_first_desc")}</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-950 mb-1">SMS & Collection Reminders</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">Send automatic collection reminders to borrowers via SMS or email instantly.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 bg-slate-950 text-slate-400 text-center text-xs font-semibold mt-auto border-t border-slate-800">
        <p>© {new Date().getFullYear()} Listahub. Professional Sari-Sari Store Management System.</p>
      </footer>

      {/* Subscription Modal (Pricing Tiers) */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
