import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface DemoBorrower {
  id: string;
  name: string;
  contact: string;
  balance: number;
  status: "FULLY_PAID" | "WITH_BALANCE";
  lastActivity: string;
}

export default function DemoPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();

  // Demo state
  const [borrowers, setBorrowers] = useState<DemoBorrower[]>([
    { id: "1", name: "Juan Cruz", contact: "0917-123-4567", balance: 350, status: "WITH_BALANCE", lastActivity: "Recorded utang ₱350" },
    { id: "2", name: "Maria Santos", contact: "0918-987-6543", balance: 0, status: "FULLY_PAID", lastActivity: "Paid ₱500 cash" },
    { id: "3", name: "Pedro Reyes", contact: "0920-555-1234", balance: 850, status: "WITH_BALANCE", lastActivity: "Recorded utang ₱850" },
    { id: "4", name: "Ana Lim", contact: "0919-444-8888", balance: 120, status: "WITH_BALANCE", lastActivity: "Recorded utang ₱120" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"borrowers" | "analytics">("borrowers");

  // Modals state
  const [showAddBorrower, setShowAddBorrower] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showSaveNotice, setShowSaveNotice] = useState(false);

  // Form states
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newContact, setNewContact] = useState("");

  const [selectedBorrowerId, setSelectedBorrowerId] = useState("1");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanNote, setLoanNote] = useState("");

  const totalUtang = borrowers.reduce((acc, curr) => acc + curr.balance, 0);
  const totalUnpaid = borrowers.filter((b) => b.balance > 0).length;

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fil" : "en");
  };

  const handleLaunchFullDashboard = () => {
    localStorage.setItem("user_token", "demo_sandbox_token");
    localStorage.setItem("is_demo_mode", "true");
    localStorage.setItem("user", JSON.stringify({
      id: 999,
      email: "demo@listahub.ph",
      store_name: "Tindahan ni Aling Nena (Demo)",
      name: "Aling Nena",
    }));
    navigate("/dashboard");
  };

  const handleAddBorrower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName) return;

    const newEntry: DemoBorrower = {
      id: Date.now().toString(),
      name: `${newFirstName} ${newLastName}`,
      contact: newContact || "No contact",
      balance: 0,
      status: "FULLY_PAID",
      lastActivity: "Added to store",
    };

    setBorrowers([newEntry, ...borrowers]);
    setNewFirstName("");
    setNewLastName("");
    setNewContact("");
    setShowAddBorrower(false);
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(loanAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setBorrowers(
      borrowers.map((b) => {
        if (b.id === selectedBorrowerId) {
          const newBal = b.balance + amountNum;
          return {
            ...b,
            balance: newBal,
            status: "WITH_BALANCE",
            lastActivity: `Utang ₱${amountNum} (${loanNote || "General items"})`,
          };
        }
        return b;
      })
    );

    setLoanAmount("");
    setLoanNote("");
    setShowAddLoan(false);
  };

  const handleQuickPay = (id: string, amount: number) => {
    setBorrowers(
      borrowers.map((b) => {
        if (b.id === id) {
          const newBal = Math.max(0, b.balance - amount);
          return {
            ...b,
            balance: newBal,
            status: newBal === 0 ? "FULLY_PAID" : "WITH_BALANCE",
            lastActivity: `Bayad ₱${amount} cash`,
          };
        }
        return b;
      })
    );
  };

  const filteredBorrowers = borrowers.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-6 flex justify-center items-start font-sans antialiased text-slate-800">
      {/* Full Widescreen Responsive Container */}
      <div className="w-full max-w-7xl min-h-[90vh] bg-slate-50 shadow-2xl rounded-3xl border border-slate-200/80 flex flex-col relative overflow-hidden">
        
        {/* Sleek Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 shadow-md flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
              DEMO
            </span>
            <span className="text-xs font-semibold text-slate-200 hidden xs:inline">{t("demo.banner_subtitle")}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-700 transition flex items-center gap-1"
            >
              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{language === "en" ? "FIL" : "EN"}</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="text-slate-300 hover:text-white text-xs font-medium px-2 py-1 transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t("demo.home")}</span>
            </button>

            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition"
            >
              {t("register.create_account")}
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          
          {/* Store Card Header */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4m-4-4l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">Tindahan ni Aling Nena</h1>
                  <p className="text-[11px] text-slate-500">Add borrowers, record loans & payments.</p>
                </div>
              </div>

              <button
                onClick={handleLaunchFullDashboard}
                className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-2.5 py-1 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
              >
                <span>Full App Demo →</span>
              </button>
            </div>

            {/* Main Action Trigger Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setShowAddBorrower(true)}
                className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Borrower</span>
              </button>

              <button
                onClick={() => setShowAddLoan(true)}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Record Loan</span>
              </button>

              <button
                onClick={() => setShowSaveNotice(true)}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-rose-50/80 to-red-50/40 p-3.5 rounded-2xl border border-red-100/80 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">
                <span>{t("demo.total_utang")}</span>
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-xl font-black text-red-600 tracking-tight">₱ {totalUtang.toFixed(2)}</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 p-3.5 rounded-2xl border border-indigo-100/80 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                <span>{t("demo.total_borrowers")}</span>
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-xl font-black text-slate-900 tracking-tight">
                {borrowers.length} <span className="text-xs font-semibold text-rose-600">({totalUnpaid} unpaid)</span>
              </div>
            </div>
          </div>

          {/* Tabbed Interactive Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            {/* Segmented Control Header */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="flex bg-slate-200/60 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("borrowers")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeTab === "borrowers"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{t("borrowers.title")} ({borrowers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeTab === "analytics"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>{t("dashboard.analytics")}</span>
                </button>
              </div>
            </div>

            {/* Tab Body */}
            {activeTab === "borrowers" ? (
              <div className="p-3 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("borrowers.search")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Borrower Cards List (3-Column Responsive Grid on Widescreen) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBorrowers.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 flex justify-between items-center transition shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {b.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{b.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Ph: {b.contact}</div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className={`text-xs font-black ${b.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          ₱ {b.balance.toFixed(2)}
                        </div>

                        {b.balance > 0 ? (
                          <button
                            onClick={() => handleQuickPay(b.id, b.balance)}
                            className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-2.5 py-0.5 rounded-lg shadow-xs transition cursor-pointer"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Pay All</span>
                          </button>
                        ) : (
                          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                            Fully Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{t("demo.analytics_overview")}</h3>
                  <p className="text-[11px] text-slate-400">{t("demo.realtime_stats")}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-left text-xs space-y-2 shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{t("demo.total_lent")}:</span>
                    <span className="font-bold text-slate-800">₱ 1,320.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-medium">{t("demo.total_collected")}:</span>
                    <span className="font-bold">₱ 600.00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/80 pt-2 text-rose-600 font-black text-sm">
                    <span>{t("demo.net_balance")}:</span>
                    <span>₱ 720.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add Borrower */}
        {showAddBorrower && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Add New Borrower</span>
                </h3>
                <button onClick={() => setShowAddBorrower(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleAddBorrower} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t("demo.first_name")}</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Cardo"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t("demo.last_name")}</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Dalisay"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="0917..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBorrower(false)}
                    className="w-1/2 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    {t("demo.cancel")}
                  </button>
                  <button type="submit" className="w-1/2 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs">
                    {t("demo.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Loan */}
        {showAddLoan && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Record Loan</span>
                </h3>
                <button onClick={() => setShowAddLoan(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleAddLoan} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t("borrowers.title")}</label>
                  <select
                    value={selectedBorrowerId}
                    onChange={(e) => setSelectedBorrowerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                  >
                    {borrowers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (₱{b.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t("demo.amount")}</label>
                  <input
                    type="number"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    placeholder="e.g. 250"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLoan(false)}
                    className="w-1/2 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    {t("demo.cancel")}
                  </button>
                  <button type="submit" className="w-1/2 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs">
                    {t("loan.save_loan")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Save Notice */}
        {showSaveNotice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-3">
              <div className="h-11 w-11 bg-indigo-50 text-indigo-600 font-bold rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("demo.save_notice_title")}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t("demo.save_notice_desc")}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  to="/register"
                  className="block w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs rounded-xl text-center shadow-xs hover:from-indigo-700 hover:to-blue-700 transition"
                >
                  {t("demo.create_account_now")}
                </Link>
                <button
                  onClick={() => setShowSaveNotice(false)}
                  className="block w-full py-1 text-xs text-slate-400 hover:text-slate-600 font-bold transition"
                >
                  {t("demo.continue_demo")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="p-3.5 bg-slate-900 text-slate-400 text-center text-[10px] mt-auto">
          <p>© {new Date().getFullYear()} Listahub. Ultra Minimalist Design.</p>
        </footer>
      </div>
    </div>
  );
}
