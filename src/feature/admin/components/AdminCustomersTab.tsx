import type { Customer, Payment } from '../../subscription/api';
import Badge from './Badge';
import PaymentTable from './PaymentTable';

const card = 'rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs space-y-5';
const button = 'rounded-2xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2';
const statuses = ['Active', 'Expiring soon', 'Expired', 'No subscription', 'Cancelled'];

interface Props {
  customers: Customer[];
  status: string;
  onSetStatus: (status: string) => void;
  search: string;
  onSetSearch: (search: string) => void;
  selected: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onRecordFor: (customerId: number) => void;
  payments: Payment[];
}

export default function AdminCustomersTab({
  customers,
  status,
  onSetStatus,
  search,
  onSetSearch,
  selected,
  onSelectCustomer,
  onRecordFor,
  payments,
}: Props) {
  const filteredCustomers = customers.filter(
    (c) =>
      (status === 'All' || c.status === status) &&
      `${c.store_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Customers List Card */}
      <section className={card}>
        {/* Master Toolbar: Filter Tabs + Search */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/60 overflow-x-auto no-scrollbar shrink-0">
            {['All', ...statuses].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetStatus(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  status === s
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{s}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${status === s ? 'bg-slate-100 text-slate-900 font-black' : 'bg-slate-200/60 text-slate-600'}`}>
                  {s === 'All' ? customers.length : customers.filter((c) => c.status === s).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2.5 w-full xl:w-auto">
            <div className="relative flex-1 sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                aria-label="Search customers"
                placeholder="Search store or email…"
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400 shadow-2xs"
                value={search}
                onChange={(e) => onSetSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSetSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-sm text-left border-collapse min-w-[580px]">
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
              {filteredCustomers.map((c) => (
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
                      {c.plan || 'No Plan'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-700 text-xs sm:text-sm">
                    <div>{c.end_date || '—'}</div>
                    {c.status === 'Expiring soon' && (
                      <div className="text-[11px] font-black text-amber-700 mt-0.5">
                        {c.days_remaining} days remaining
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectCustomer(c)}
                      className="h-8 w-8 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-all duration-150 cursor-pointer border border-blue-200/70 active:scale-95 shadow-2xs inline-flex items-center justify-center ml-auto"
                      title="View Subscription Details"
                      aria-label="View Subscription Details"
                    >
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
          {!filteredCustomers.length && (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-slate-700">No matching subscriptions found.</p>
              <p className="text-xs text-slate-400 mt-1">Try changing your search query or filter selection.</p>
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-semibold">
          <span>
            Showing <strong className="text-slate-800 font-black">{filteredCustomers.length}</strong> of <strong className="text-slate-800 font-black">{customers.length}</strong> subscriptions
          </span>
          <span className="capitalize text-slate-500">
            Status filter: <strong className="text-slate-800 font-black">{status}</strong>
          </span>
        </div>
      </section>

      {/* Selected Customer Inspection Banner/Panel */}
      {selected && (
        <section className="rounded-3xl border-2 border-blue-500/40 bg-white p-5 sm:p-7 shadow-xl space-y-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                {selected.store_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-950 tracking-tight">{selected.store_name}</h2>
                  <Badge status={selected.status} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">{selected.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                className={`${button} flex-1 sm:flex-none`}
                onClick={() => onRecordFor(selected.user_id)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => onSelectCustomer(null)}
                aria-label="Close customer details"
                className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-black transition cursor-pointer shrink-0"
                title="Close Inspector"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-black uppercase text-slate-400 block">Current Plan</span>
              <span className="text-sm font-black text-slate-900 capitalize mt-1 block">{selected.plan || 'No plan'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-black uppercase text-slate-400 block">Subscription Start</span>
              <span className="text-sm font-black text-slate-900 mt-1 block">{selected.start_date || '—'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-black uppercase text-slate-400 block">Expiration Date</span>
              <span className="text-sm font-black text-slate-900 mt-1 block">{selected.end_date || '—'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-black uppercase text-slate-400 block">Days Remaining</span>
              <span className={`text-sm font-black mt-1 block ${selected.days_remaining !== undefined && selected.days_remaining <= 7 ? 'text-amber-600' : 'text-slate-900'}`}>
                {selected.days_remaining !== undefined ? `${selected.days_remaining} days` : '—'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Payment Records for {selected.store_name}
            </h3>
            <PaymentTable payments={payments.filter((p) => p.user_id === selected.user_id)} />
          </div>
        </section>
      )}
    </div>
  );
}
