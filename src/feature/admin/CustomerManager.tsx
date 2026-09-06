import { useCallback, useEffect, useState } from 'react';
import { adminRequest } from './api';
import type { ManagedCustomer } from './api';
import UserDetailModal from './modals/UserDetailModal';
import AccountFormModal from './modals/AccountFormModal';
import ResetPasswordModal from './modals/ResetPasswordModal';
import DeleteAccountModal from './modals/DeleteAccountModal';

const inputStyle =
  'w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400';
const primaryButton =
  'rounded-2xl bg-blue-600 px-4 py-3 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2';

export default function CustomerManager({
  onChange,
  onView,
}: {
  onChange: () => void;
  onView?: (id: number) => void;
}) {
  const [customers, setCustomers] = useState<ManagedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'deleted'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  // Modals state
  const [viewingCustomer, setViewingCustomer] = useState<ManagedCustomer | null>(null);
  const [editing, setEditing] = useState<ManagedCustomer | null | undefined>(undefined);
  const [resettingPassword, setResettingPassword] = useState<ManagedCustomer | null>(null);
  const [deleting, setDeleting] = useState<ManagedCustomer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCustomers(await adminRequest<ManagedCustomer[]>('/customers'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changed = (message: string) => {
    setNotice(message);
    void load();
    onChange();
  };

  const activeCount = customers.filter((c) => !c.deleted_at).length;
  const deletedCount = customers.filter((c) => !!c.deleted_at).length;

  const rows = customers
    .filter((c) => {
      const matchesFilter =
        filter === 'all' ? true : filter === 'deleted' ? !!c.deleted_at : !c.deleted_at;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.store_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        String(c.user_id).includes(q.replace('#', ''));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.created_at || '').localeCompare(a.created_at || '');
      }
      if (sortBy === 'oldest') {
        return (a.created_at || '').localeCompare(b.created_at || '');
      }
      if (sortBy === 'az') {
        return a.store_name.localeCompare(b.store_name);
      }
      if (sortBy === 'za') {
        return b.store_name.localeCompare(a.store_name);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards for User Management */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Accounts */}
        <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-2xs border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Total Accounts
            </span>
            <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-slate-700/70 flex items-center justify-center text-blue-400 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-black tracking-tight">{customers.length}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Registered store merchants</p>
          </div>
        </div>

        {/* Active Store Owners */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Active Stores
            </span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{activeCount}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {customers.length > 0 ? `${Math.round((activeCount / customers.length) * 100)}% operational rate` : 'No accounts'}
          </p>
        </div>

        {/* Deactivated Accounts */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Deactivated
            </span>
            <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{deletedCount}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Suspended (data preserved)</p>
          </div>
        </div>
      </div>

      {/* Main Users Card */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs space-y-5">
        {error && (
          <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200/90 p-4 text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-between">
            <span>{error}</span>
            <button className="underline font-black cursor-pointer ml-4" onClick={() => void load()}>
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div role="status" className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-4 text-emerald-700 text-xs sm:text-sm font-bold animate-fadeIn flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} className="text-emerald-800 hover:text-emerald-950 p-1 rounded-lg transition cursor-pointer" aria-label="Dismiss notice">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Master Toolbar: Filter Tabs + Search + Sort + Add User */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/60 overflow-x-auto no-scrollbar shrink-0">
            {(
              [
                { id: 'all', label: 'All Accounts', count: customers.length },
                { id: 'active', label: 'Active', count: activeCount },
                { id: 'deleted', label: 'Deactivated', count: deletedCount },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  filter === item.id
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${filter === item.id ? 'bg-slate-100 text-slate-900 font-black' : 'bg-slate-200/60 text-slate-600'}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Sort, and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                aria-label="Search user accounts"
                placeholder="Search store, email, or #ID…"
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400 shadow-2xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Sort Selector */}
              <select
                aria-label="Sort users by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 sm:flex-none rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition cursor-pointer shadow-2xs shrink-0"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Store (A–Z)</option>
                <option value="za">Store (Z–A)</option>
              </select>

              {/* Add Store Owner Primary Button */}
              <button
                type="button"
                className={`${primaryButton} flex-1 sm:flex-none justify-center`}
                onClick={() => setEditing(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span className="whitespace-nowrap">Add Store Owner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-sm text-left border-collapse min-w-[620px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 bg-slate-50/40">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap font-black">Store / Account</th>
                <th className="px-4 py-3.5 whitespace-nowrap font-black">Account ID</th>
                <th className="px-4 py-3.5 whitespace-nowrap font-black">Joined Date</th>
                <th className="px-4 py-3.5 whitespace-nowrap font-black">Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.user_id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Store Name & Email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0 border border-blue-400/20">
                        {c.store_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 leading-tight truncate">{c.store_name}</p>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">{c.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Account ID */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
                      #{c.user_id}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-600 text-xs sm:text-sm">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {!c.deleted_at ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-500 border border-slate-200/80 shadow-2xs">
                        Deactivated
                      </span>
                    )}
                  </td>

                  {/* Clean Action SVG Icon Buttons right-aligned */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <button
                        type="button"
                        onClick={() => setViewingCustomer(c)}
                        className="h-8 w-8 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-all duration-150 cursor-pointer border border-blue-200/70 active:scale-95 shadow-2xs flex items-center justify-center"
                        title="View Account Details"
                        aria-label="View Account Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {!c.deleted_at ? (
                        <>
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setEditing(c)}
                            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white transition-all duration-150 cursor-pointer border border-slate-200/70 active:scale-95 shadow-2xs flex items-center justify-center"
                            title="Edit Store Account"
                            aria-label="Edit Store Account"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => setResettingPassword(c)}
                            className="h-8 w-8 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white transition-all duration-150 cursor-pointer border border-amber-200/70 active:scale-95 shadow-2xs flex items-center justify-center"
                            title="Reset Password"
                            aria-label="Reset Password"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>

                          {/* Deactivate */}
                          <button
                            type="button"
                            onClick={() => setDeleting(c)}
                            className="h-8 w-8 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all duration-150 cursor-pointer border border-rose-200/70 active:scale-95 shadow-2xs flex items-center justify-center"
                            title="Deactivate Account"
                            aria-label="Deactivate Account"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        /* Restore Account */
                        <button
                          type="button"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            setError('');
                            try {
                              await adminRequest(`/customers/${c.user_id}/restore`, 'POST');
                              changed(`Store account for ${c.store_name} restored successfully.`);
                            } catch (e) {
                              setError(e instanceof Error ? e.message : 'Unable to restore account.');
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className="h-8 w-8 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all duration-150 cursor-pointer border border-emerald-200/70 active:scale-95 shadow-2xs disabled:opacity-50 flex items-center justify-center"
                          title="Restore Account"
                          aria-label="Restore Account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <svg className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm font-semibold">Loading user accounts…</p>
            </div>
          ) : !rows.length ? (
            <div className="py-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">No {filter === 'deleted' ? 'deactivated' : 'matching'} user accounts found.</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters above.</p>
            </div>
          ) : null}
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-semibold">
          <span>
            Showing <strong className="text-slate-800 font-black">{rows.length}</strong> of <strong className="text-slate-800 font-black">{customers.length}</strong> merchant accounts
          </span>
          <div className="flex items-center gap-2">
            <span className="capitalize text-slate-500">
              Filter: <strong className="text-slate-800 font-black">{filter === 'all' ? 'All Accounts' : filter === 'active' ? 'Active' : 'Deactivated'}</strong>
            </span>
            {search && (
              <span className="text-blue-600 font-bold">
                · matching &ldquo;{search}&rdquo;
              </span>
            )}
          </div>
        </div>
      </section>

      {/* User Details Slide-over / Modal */}
      {viewingCustomer && (
        <UserDetailModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onEdit={() => {
            const c = viewingCustomer;
            setViewingCustomer(null);
            setEditing(c);
          }}
          onResetPassword={() => {
            const c = viewingCustomer;
            setViewingCustomer(null);
            setResettingPassword(c);
          }}
          onDeactivate={() => {
            const c = viewingCustomer;
            setViewingCustomer(null);
            setDeleting(c);
          }}
          onViewSubscription={() => {
            if (onView) {
              onView(viewingCustomer.user_id);
            }
          }}
        />
      )}

      {/* Add / Edit User Modal */}
      {editing !== undefined && (
        <AccountFormModal
          customer={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            changed(editing ? 'Store account updated.' : 'New store owner account created.');
          }}
        />
      )}

      {/* Reset Password Modal */}
      {resettingPassword && (
        <ResetPasswordModal
          customer={resettingPassword}
          onClose={() => setResettingPassword(null)}
          onSaved={() => {
            setResettingPassword(null);
            changed(`Password for ${resettingPassword.store_name} successfully reset.`);
          }}
        />
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      {deleting && (
        <DeleteAccountModal
          customer={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            changed(`Store account for ${deleting.store_name} deactivated.`);
          }}
        />
      )}
    </div>
  );
}
