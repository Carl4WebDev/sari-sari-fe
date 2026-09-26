import { money } from '../../subscription/api';
import type { Customer, Payment } from '../../subscription/api';
import type { PilotData } from '../AdminPage';
import Badge from './Badge';
import PaymentTable from './PaymentTable';

const card = 'rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs space-y-5';

interface Props {
  customers: Customer[];
  payments: Payment[];
  month: string;
  lastMonth: string;
  revenue: (period?: string) => number;
  soon: Customer[];
  pilotData: PilotData | null;
  onViewAllPayments: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityColor(status: string): string {
  switch (status) {
    case 'Online now': return 'bg-emerald-500';
    case 'Active recently': return 'bg-emerald-400';
    case 'Active today': return 'bg-blue-500';
    case 'This week': return 'bg-amber-500';
    case 'Never logged in': return 'bg-slate-300';
    default: return 'bg-slate-400';
  }
}

export default function AdminOverviewTab({
  customers,
  payments,
  month,
  lastMonth,
  revenue,
  soon,
  pilotData,
  onViewAllPayments,
  onSelectCustomer,
}: Props) {
  const customerTable = (rows: Customer[]) => {
    if (!rows.length) {
      return (
        <div className="py-12 text-center">
          <p className="text-sm font-bold text-slate-700">No subscriptions to show.</p>
        </div>
      );
    }

    return (
      <>
        {/* Mobile Cards */}
        <div className="sm:hidden space-y-2.5">
          {rows.map((c) => (
            <div key={c.user_id} className="rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {c.store_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-900 text-sm truncate">{c.store_name}</div>
                  <div className="text-[11px] font-semibold text-slate-400 truncate">{c.email}</div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200/70 capitalize shrink-0">
                  {c.plan || 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge status={c.status} />
                <div className="text-xs text-slate-500">
                  {c.end_date || '—'}
                  {c.status === 'Expiring soon' && (
                    <span className="ml-1 font-black text-amber-700">({c.days_remaining}d)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 bg-slate-50/40">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap font-black">Customer / Store</th>
                <th className="px-4 py-3.5 whitespace-nowrap font-black">Plan</th>
                <th className="px-4 py-3.5 whitespace-nowrap font-black">Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap font-black">Expiration</th>
                <th className="px-5 py-3.5 text-right font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr className="hover:bg-slate-50/60 transition" key={c.user_id}>
                  <td className="px-5 py-4 font-black text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {c.store_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-900 font-black truncate">{c.store_name}</div>
                        <div className="text-xs font-semibold text-slate-400 truncate mt-0.5">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 capitalize font-bold text-slate-800">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/70">
                      {c.plan || 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-4"><Badge status={c.status} /></td>
                  <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-700 text-sm">
                    <div>{c.end_date || '—'}</div>
                    {c.status === 'Expiring soon' && (
                      <div className="text-[11px] font-black text-amber-700 mt-0.5">{c.days_remaining} days remaining</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => onSelectCustomer(c)}
                      className="h-8 w-8 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-all duration-150 cursor-pointer border border-blue-200/70 active:scale-95 shadow-2xs inline-flex items-center justify-center ml-auto"
                      title="View Subscription Details">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
        {[
          {
            label: 'Total customers',
            value: customers.length,
            sub: 'Registered stores',
            dark: true,
            icon: (
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            iconBg: 'bg-slate-800 border-slate-700/70',
          },
          {
            label: 'Active subscriptions',
            value: customers.filter((c) => ['Active', 'Expiring soon'].includes(c.status)).length,
            sub: 'Live subscriptions',
            badge: 'Live',
            dark: false,
            icon: (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            iconBg: 'bg-emerald-50 border-emerald-100',
          },
          {
            label: 'Expiring soon',
            value: soon.length,
            sub: 'Within 7 days',
            dark: false,
            icon: (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            iconBg: 'bg-amber-50 border-amber-100',
          },
          {
            label: 'Expired subscriptions',
            value: customers.filter((c) => c.status === 'Expired').length,
            sub: 'Needs renewal',
            dark: false,
            icon: (
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
            iconBg: 'bg-rose-50 border-rose-100',
          },
          {
            label: 'Revenue this month',
            value: money(revenue(month)),
            sub: 'Verified collections',
            dark: false,
            icon: (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
            iconBg: 'bg-blue-50 border-blue-100',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-3xl p-5 sm:p-6 shadow-2xs border ${
              stat.dark
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-900 border-slate-200/90'
            } flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-wider ${stat.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {stat.label}
              </span>
              <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center shadow-xs shrink-0 ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-black tracking-tight">{stat.value}</p>
                {stat.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pilot Monitoring Section */}
      {pilotData && (
        <section className={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Pilot User Activity</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Real-time user presence and activity status</p>
            </div>
            <div className="flex items-center gap-2">
              {Number(pilotData.stats.online_now) > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {pilotData.stats.online_now} online now
                </span>
              )}
            </div>
          </div>

          {/* Activity Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Online now', value: pilotData.stats.online_now, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Active today', value: pilotData.stats.active_today, color: 'text-blue-600 bg-blue-50 border-blue-200' },
              { label: 'This week', value: pilotData.stats.active_this_week, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              { label: 'Inactive', value: pilotData.stats.inactive, color: 'text-slate-600 bg-slate-50 border-slate-200' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.color}`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* User Activity — Mobile cards, Desktop table */}
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2.5">
            {pilotData.customers.map((c) => (
              <div key={c.user_id} className="rounded-2xl border border-slate-200 bg-white p-3.5">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {c.store_name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${activityColor(c.activity_status)}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-900 text-sm truncate">{c.store_name}</div>
                    <div className="text-[11px] font-semibold text-slate-400 truncate">{c.email}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black shrink-0 ${
                    c.plan === 'premium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {c.plan === 'premium' ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center gap-1.5 font-bold ${
                    c.activity_status === 'Online now' ? 'text-emerald-700' :
                    c.activity_status === 'Active recently' ? 'text-emerald-600' :
                    c.activity_status === 'Active today' ? 'text-blue-600' :
                    c.activity_status === 'This week' ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${activityColor(c.activity_status)}`} />
                    {c.activity_status}
                  </span>
                  <span className="text-slate-400 font-semibold">{timeAgo(c.last_seen)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 bg-slate-50/40">
                <tr>
                  <th className="px-4 py-3 font-black">User</th>
                  <th className="px-4 py-3 font-black">Plan</th>
                  <th className="px-4 py-3 font-black">Activity</th>
                  <th className="px-4 py-3 font-black">Last Seen</th>
                  <th className="px-4 py-3 font-black">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pilotData.customers.map((c) => (
                  <tr key={c.user_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {c.store_name.charAt(0).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${activityColor(c.activity_status)}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 truncate text-xs">{c.store_name}</div>
                          <div className="text-[11px] font-semibold text-slate-400 truncate">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black ${
                        c.plan === 'premium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {c.plan === 'premium' ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        c.activity_status === 'Online now' ? 'text-emerald-700' :
                        c.activity_status === 'Active recently' ? 'text-emerald-600' :
                        c.activity_status === 'Active today' ? 'text-blue-600' :
                        c.activity_status === 'This week' ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${activityColor(c.activity_status)}`} />
                        {c.activity_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{timeAgo(c.last_seen)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                      {new Date(c.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Activity Feed */}
          {pilotData.recent_activity.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <h3 className="font-black text-sm text-slate-900 mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pilotData.recent_activity.slice(0, 10).map((a) => (
                  <div key={a.log_id} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-semibold whitespace-nowrap">
                      {timeAgo(a.created_at)}
                    </span>
                    <span className="font-bold text-slate-700">{a.store_name}</span>
                    <span className="text-slate-500">{a.action}</span>
                    {a.detail && <span className="text-slate-400 truncate">{a.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3 Overview Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Panel 1: Subscription Overview */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Subscriptions</h2>
            </div>
            <div className="space-y-1">
              {['Active', 'Expiring soon', 'Expired', 'No subscription', 'Cancelled'].map((s) => (
                <div key={s} className="flex justify-between items-center py-2 px-2.5 rounded-xl">
                  <Badge status={s} />
                  <strong className="text-sm font-black text-slate-900">
                    {customers.filter((c) => c.status === s).length}
                  </strong>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-3">
            Expiring soon: within 7 days
          </p>
        </section>

        {/* Panel 2: Revenue */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Revenue</h2>
            </div>
            <div className="space-y-1">
              {[
                ['This month', revenue(month)],
                ['Last month', revenue(lastMonth)],
                ['Total collected', revenue()],
              ].map(([l, v]) => (
                <div key={String(l)} className="py-2.5 px-2.5 flex justify-between items-center border-b border-slate-100 text-sm">
                  <span className="font-semibold text-slate-500">{l}</span>
                  <strong className="font-black text-slate-900">{money(v)}</strong>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-3">
            Verified subscription payments (₱)
          </p>
        </section>

        {/* Panel 3: Customer Growth */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Customers</h2>
            </div>
            <div className="space-y-1">
              {[
                ['Total customers', customers.length],
                ['New this month', customers.filter((c) => c.created_at.slice(0, 7) === month).length],
                ['New last month', customers.filter((c) => c.created_at.slice(0, 7) === lastMonth).length],
              ].map(([l, v]) => (
                <div key={String(l)} className="py-2.5 px-2.5 flex justify-between items-center border-b border-slate-100 text-sm">
                  <span className="font-semibold text-slate-500">{l}</span>
                  <strong className="font-black text-slate-900">{v}</strong>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-3">
            All registered store accounts
          </p>
        </section>
      </div>

      {/* Expiring Soon Table */}
      <section className={card}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Expiring soon</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Subscriptions requiring renewal within 7 days</p>
          </div>
        </div>
        {customerTable(soon.slice(0, 5))}
      </section>

      {/* Recent Payments Table */}
      <section className={card}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">Recent payments</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Latest verified subscription transactions</p>
          </div>
          <button
            className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 hover:underline"
            onClick={onViewAllPayments}
          >
            <span>View all</span>
            <span>→</span>
          </button>
        </div>
        <PaymentTable payments={payments.slice(0, 5)} />
      </section>
    </div>
  );
}
