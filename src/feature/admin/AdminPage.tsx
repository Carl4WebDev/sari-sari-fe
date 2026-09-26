import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { subscriptionRequest } from '../subscription/api';
import type { AdminData, Customer, Payment } from '../subscription/api';
import { adminRequest, adminSessionKey, endAdminSession } from './api';
import type { AdminProfileData } from './api';
import AdminSidebar from './components/AdminSidebar';
import AdminOverviewTab from './components/AdminOverviewTab';
import AdminPaymentsTab from './components/AdminPaymentsTab';
import RecordPaymentModal from './modals/RecordPaymentModal';

export interface ActivityCustomer {
  user_id: number;
  store_name: string;
  email: string;
  created_at: string;
  last_seen: string | null;
  plan: string | null;
  subscription_status: string | null;
  end_date: string | null;
  activity_status: string;
}

export interface ActivityLog {
  log_id: number;
  user_id: number;
  store_name: string;
  action: string;
  detail: string;
  created_at: string;
}

export interface PilotStats {
  online_now: number;
  active_today: number;
  active_this_week: number;
  inactive: number;
  total_customers: number;
}

export interface PilotData {
  customers: ActivityCustomer[];
  recent_activity: ActivityLog[];
  stats: PilotStats;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [pilotData, setPilotData] = useState<PilotData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [recordFor, setRecordFor] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    let prevWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const handleResize = () => {
      const currWidth = window.innerWidth;
      if (prevWidth < 1024 && currWidth >= 1024) {
        setIsSidebarOpen(true);
      } else if (prevWidth >= 1024 && currWidth < 1024) {
        setIsSidebarOpen(false);
      }
      prevWidth = currWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [account, dashboard, pilot] = await Promise.all([
        adminRequest<AdminProfileData>('/profile'),
        subscriptionRequest<AdminData>('/admin'),
        adminRequest<PilotData>('/activity').catch(() => null),
      ]);
      setProfile(account);
      setData(dashboard);
      setPilotData(pilot);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!sessionStorage.getItem(adminSessionKey)) {
    return <Navigate to="/" replace />;
  }

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setError('');
    try {
      await adminRequest('/logout', 'POST');
      endAdminSession();
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign out failed. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  const handleNavTab = (newTab: string) => {
    setTab(newTab);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const customers = data?.customers || [];
  const payments = data?.payments || [];
  const month = data?.today.slice(0, 7) || '';
  const lastMonth = data
    ? new Date(Date.UTC(Number(data.today.slice(0, 4)), Number(data.today.slice(5, 7)) - 2, 1)).toISOString().slice(0, 7)
    : '';
  const revenue = (period?: string) =>
    payments.filter((p) => !period || p.payment_date.startsWith(period)).reduce((sum, p) => sum + Number(p.amount), 0);
  const soon = customers
    .filter((c) => c.status === 'Expiring soon')
    .sort((a, b) => (a.days_remaining || 0) - (b.days_remaining || 0));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-900 selection:text-white">
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tab={tab}
        onSelectTab={handleNavTab}
        profile={profile}
        signingOut={signingOut}
        onSignOut={() => void signOut()}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-md shadow-2xs gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200/60 active:scale-95 shadow-2xs flex items-center justify-center shrink-0"
                title="Open sidebar"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Admin</span>
                <span className="text-xs text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-xs sm:text-base font-black text-slate-900 leading-tight truncate">
                  {tab === 'Overview' ? 'Pilot Dashboard' : 'Payment Records'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              disabled={!data || loading}
              onClick={() => setRecordFor(0)}
              className="rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-black shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Record Payment</span>
              <span className="sm:hidden text-xs">Payment</span>
            </button>

            {/* Mobile Sign Out */}
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void signOut()}
              className="lg:hidden rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 px-2.5 py-2 text-xs font-bold transition cursor-pointer border border-slate-200/60 active:scale-95"
            >
              {signingOut ? '…' : 'Sign out'}
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {tab === 'Overview' ? 'Pilot Dashboard' : 'Payment Records'}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                {tab === 'Overview' && 'Monitor pilot users, activity, subscriptions, and system health.'}
                {tab === 'Payments' && 'Complete payment history and transaction verification records.'}
              </p>
            </div>
            {tab === 'Overview' && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live System
                </span>
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200/90 p-4 text-rose-700 text-sm font-bold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => void refresh()} className="underline cursor-pointer ml-4 font-black">
                Retry
              </button>
            </div>
          )}

          {notice && (
            <div role="status" className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-4 text-emerald-700 text-sm font-bold animate-fadeIn">
              {notice}
            </div>
          )}

          {data && !error && (
            <>
              {tab === 'Overview' && (
                <AdminOverviewTab
                  customers={customers}
                  payments={payments}
                  month={month}
                  lastMonth={lastMonth}
                  revenue={revenue}
                  soon={soon}
                  pilotData={pilotData}
                  onViewAllPayments={() => setTab('Payments')}
                  onSelectCustomer={() => {}}
                />
              )}

              {tab === 'Payments' && (
                <AdminPaymentsTab
                  payments={payments}
                  revenue={revenue}
                  month={month}
                />
              )}
            </>
          )}
        </main>
      </div>

      {recordFor !== null && data && (
        <RecordPaymentModal
          data={data}
          customerId={recordFor}
          onClose={() => setRecordFor(null)}
          onSaved={(expiry) => {
            setRecordFor(null);
            setNotice(`Payment verified and saved. Subscription expiration: ${expiry}.`);
            void refresh();
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile admin navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg shadow-slate-950/10 flex items-center justify-around"
      >
        <button
          type="button"
          onClick={() => handleNavTab('Overview')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
            tab === 'Overview' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-700 font-bold'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavTab('Payments')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
            tab === 'Payments' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-700 font-bold'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-[10px] tracking-tight">Payments</span>
        </button>
      </nav>
    </div>
  );
}
