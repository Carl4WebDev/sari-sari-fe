import { useState } from 'react';
import { money } from '../../subscription/api';
import type { Payment } from '../../subscription/api';
import PaymentTable from './PaymentTable';

const card = 'rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs space-y-5';

interface Props {
  payments: Payment[];
  revenue: (period?: string) => number;
  month: string;
}

export default function AdminPaymentsTab({ payments, revenue, month }: Props) {
  const [paymentSearch, setPaymentSearch] = useState('');

  const filteredPayments = payments.filter(
    (p) =>
      !paymentSearch ||
      p.store_name.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.reference_number.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.payment_method.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Payments Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Collections */}
        <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-2xs border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Collections</span>
            <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-slate-700/70 flex items-center justify-center text-blue-400 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-black tracking-tight">{money(revenue())}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">All verified payments to date</p>
          </div>
        </div>

        {/* Collections This Month */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">This Month</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{money(revenue(month))}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Collections for {month}</p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Verified Transactions</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{payments.length}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Manual records confirmed</p>
          </div>
        </div>
      </div>

      {/* Payment Table Card */}
      <section className={card}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">Payment History</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Verified subscription payment receipts and references</p>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              aria-label="Search payments"
              placeholder="Search store, ref #, or method…"
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400 shadow-2xs"
              value={paymentSearch}
              onChange={(e) => setPaymentSearch(e.target.value)}
            />
            {paymentSearch && (
              <button
                type="button"
                onClick={() => setPaymentSearch('')}
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

        <PaymentTable payments={filteredPayments} />

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-semibold">
          <span>
            Showing <strong className="text-slate-800 font-black">{filteredPayments.length}</strong> of <strong className="text-slate-800 font-black">{payments.length}</strong> verified payments
          </span>
          {paymentSearch && (
            <span className="text-blue-600 font-bold">
              Filtered by &ldquo;{paymentSearch}&rdquo;
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
