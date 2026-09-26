import { useEffect, useState } from 'react';
import { money, subscriptionRequest } from '../api';
import type { Customer, Payment } from '../api';

export default function SubscriptionStatus() {
  const [data, setData] = useState<{ customer: Customer; payments: Payment[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('is_demo_mode') === 'true') return;
    subscriptionRequest<{ customer: Customer; payments: Payment[] }>('/mine')
      .then(setData)
      .catch(() => setError('Subscription information is unavailable. Please refresh to try again.'));
  }, []);

  const isPremium = data?.customer?.plan === 'premium' && ['Active', 'Expiring soon'].includes(data?.customer?.status);
  const planLabel = isPremium ? 'Premium' : 'Free';

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-black">Your Subscription</h2>

      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

      {data && (
        <>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {planLabel}
            </span>
            <span className="text-sm text-slate-500 capitalize">{data.customer.status}</span>
          </div>

          {isPremium && (
            <p className="text-sm text-slate-500">
              Start: {data.customer.start_date || '—'} · Expiration: {data.customer.end_date || '—'}
            </p>
          )}

          {!isPremium && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-800">Upgrade to Premium</p>
              <p className="text-xs text-amber-600">
                Want Premium? Contact the Listahub administrator to arrange your subscription and payment.
              </p>
              <p className="text-sm font-bold text-amber-900">📞 0927 616 8478</p>
              <p className="text-xs text-amber-600">
                Mostly available on Saturdays & Sundays, but feel free to call anytime — I&apos;ll call back if I miss your call.
              </p>
            </div>
          )}

          {data.payments.length > 0 && (
            <>
              <h3 className="text-sm font-bold">Payment History</h3>
              {data.payments.map(p => (
                <div key={p.payment_id} className="border-t border-slate-100 pt-3 text-sm">
                  <strong>{money(p.amount)}</strong> · {p.payment_date} · {p.payment_method}
                  <p className="text-xs text-slate-500 capitalize">
                    {p.plan} · {p.duration} month(s) · Reference: {p.reference_number}
                  </p>
                </div>
              ))}
            </>
          )}

          {data.payments.length === 0 && isPremium && (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          )}
        </>
      )}
    </section>
  );
}
