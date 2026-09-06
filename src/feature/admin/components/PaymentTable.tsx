import { money } from '../../subscription/api';
import type { Payment } from '../../subscription/api';

interface Props {
  payments: Payment[];
}

export default function PaymentTable({ payments }: Props) {
  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
      <table className="w-full text-left text-sm border-collapse min-w-[580px]">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 bg-slate-50/40">
          <tr>
            {['Customer / Plan', 'Amount', 'Method / Reference', 'Payment Date', 'Verified By'].map((x) => (
              <th key={x} className="px-5 py-3.5 whitespace-nowrap font-black">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p) => (
            <tr key={p.payment_id} className="hover:bg-slate-50/60 transition">
              <td className="px-5 py-4 font-black text-slate-900">
                <div className="font-black text-slate-900 text-sm sm:text-base">{p.store_name}</div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold capitalize text-slate-500 mt-0.5">
                  <span className="font-bold text-blue-600">{p.plan}</span>
                  <span>·</span>
                  <span>{p.duration} month(s)</span>
                </div>
                {p.notes && <div className="mt-1 text-xs font-normal text-slate-400 italic">&ldquo;{p.notes}&rdquo;</div>}
              </td>
              <td className="px-5 py-4 font-black text-slate-900 text-sm sm:text-base whitespace-nowrap">
                {money(p.amount)}
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/80">
                  {p.payment_method}
                </span>
                <div className="text-xs font-mono font-semibold text-slate-400 mt-1">{p.reference_number}</div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-600 text-xs sm:text-sm">
                {p.payment_date}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                  <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {p.verifier}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!payments.length && (
        <div className="py-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700">No payment transactions recorded yet.</p>
          <p className="text-xs text-slate-400 mt-1">Manual payment verifications will appear here.</p>
        </div>
      )}
    </div>
  );
}
