import { useEffect, useState } from 'react';
import { money, subscriptionRequest } from '../api';
import type { Customer, Payment } from '../api';
export default function SubscriptionStatus() {
  const [data,setData] = useState<{customer: Customer; payments: Payment[]} | null>(null);
  const [error,setError] = useState('');
  useEffect(() => {
    if(localStorage.getItem('is_demo_mode') === 'true') return;
    subscriptionRequest<{customer: Customer; payments: Payment[]}>('/mine').then(setData).catch(() => setError('Subscription information is unavailable. Please refresh to try again.'));
  }, []);
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4"><h2 className="text-lg font-black">Your subscription</h2>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}{data && <><p className="text-sm"><strong className="capitalize">{data.customer.plan || 'No plan'}</strong> · {data.customer.status}</p><p className="text-sm text-slate-500">Start: {data.customer.start_date || '—'} · Expiration: {data.customer.end_date || '—'}</p><h3 className="text-sm font-bold">Payment history</h3>{data.payments.length ? data.payments.map(p => <div key={p.payment_id} className="border-t border-slate-100 pt-3 text-sm"><strong>{money(p.amount)}</strong> · {p.payment_date} · {p.payment_method}<p className="text-xs text-slate-500 capitalize">{p.plan} · {p.duration} month(s) · Reference: {p.reference_number}</p></div>) : <p className="text-sm text-slate-500">No payments recorded yet.</p>}</>}<p className="text-sm text-slate-500">Can't pay online? Contact ListaHub for manual payment. Your subscription updates here once payment is verified.</p></section>;
}
