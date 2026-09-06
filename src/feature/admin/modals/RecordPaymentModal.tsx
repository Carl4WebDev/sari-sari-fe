import { useEffect, useRef, useState } from 'react';
import { subscriptionRequest, money } from '../../subscription/api';
import type { AdminData } from '../../subscription/api';

const button =
  'rounded-2xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2';
const field =
  'w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400 shadow-2xs';

interface Props {
  data: AdminData;
  customerId: number;
  onClose: () => void;
  onSaved: (expiry: string) => void;
}

export default function RecordPaymentModal({
  data,
  customerId,
  onClose,
  onSaved,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [id, setId] = useState(String(customerId || ''));
  const initial = data.customers.find((c) => c.user_id === customerId);
  const [plan, setPlan] = useState(initial?.plan || 'basic');
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState(data.today);
  const [method, setMethod] = useState('GCash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const customer = data.customers.find((c) => String(c.user_id) === id);
  const active = customer && ['Active', 'Expiring soon'].includes(customer.status);
  const currentPlan = active ? customer.plan! : plan;
  const rate = data.plans.find((p) => p.id === currentPlan)!;
  const amount = (duration === 12 ? rate.annualMonthly : rate.monthly) * duration;
  const base = active ? customer.end_date! : date;
  const preview = new Date(`${base}T00:00:00Z`);
  const day = preview.getUTCDate();
  preview.setUTCDate(1);
  preview.setUTCMonth(preview.getUTCMonth() + duration);
  preview.setUTCDate(Math.min(day, new Date(Date.UTC(preview.getUTCFullYear(), preview.getUTCMonth() + 1, 0)).getUTCDate()));
  const expiry = Number.isFinite(preview.getTime()) ? preview.toISOString().slice(0, 10) : '—';

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!saving) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/70"
    >
      <form
        className="p-5 sm:p-7 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (saving || !verified) return;
          setSaving(true);
          setError('');
          try {
            const payload = {
              user_id: Number(id),
              plan: currentPlan,
              duration,
              payment_date: date,
              payment_method: method,
              reference_number: reference,
              amount,
              notes,
            };
            const result = await subscriptionRequest<{ end_date: string }>('/admin/payments', payload);
            onSaved(result.end_date);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save payment.');
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">Record Manual Payment</h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">Verify the receipt before activating or renewing a plan.</p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-black transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <p role="alert" className="text-sm font-bold text-rose-700 bg-rose-50 p-3 rounded-2xl border border-rose-200/90">{error}</p>}

        <fieldset disabled={saving} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Customer
            </label>
            <select
              required
              className={field}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setPlan(data.customers.find((c) => String(c.user_id) === e.target.value)?.plan || 'basic');
              }}
            >
              <option value="">Select a customer</option>
              {data.customers.map((c) => (
                <option key={c.user_id} value={c.user_id}>
                  {c.store_name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Plan
              </label>
              <select className={field} disabled={!!active} value={currentPlan} onChange={(e) => setPlan(e.target.value)}>
                {data.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {money(p.monthly)}/month
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <select className={field} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {[1, 3, 6, 12].map((d) => (
                  <option key={d} value={d}>
                    {d} month{d > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select className={field} value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>GCash</option>
                <option value="Maya">Maya</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other manual payment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <input required type="date" max={data.today} className={field} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Reference Number
            </label>
            <input required maxLength={120} placeholder="e.g. 10029384819" className={field} value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Notes <span className="font-normal text-slate-400 lowercase">(optional)</span>
            </label>
            <textarea maxLength={1000} placeholder="Additional details or reference notes…" className={field} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 text-sm space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Amount paid</span>
              <strong className="font-black text-slate-900">{money(amount)}</strong>
            </div>
            {duration === 12 && <p className="text-xs font-bold text-blue-700">Existing annual rate: {money(rate.annualMonthly)} × 12 months</p>}
            <div className="flex justify-between font-semibold text-slate-700">
              <span>New expiration</span>
              <strong className="font-black text-slate-900">{expiry}</strong>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              {active ? 'Renews the current plan from its existing expiration.' : 'Subscription starts on the payment date.'}
            </p>
          </div>

          <label className="flex gap-3 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition">
            <input
              type="checkbox"
              required
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="rounded-lg h-4 w-4 text-blue-600 cursor-pointer"
            />
            <span>I verified receipt of {money(amount)} and the reference number.</span>
          </label>
        </fieldset>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
          <button type="button" disabled={saving} className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer text-center" onClick={onClose}>
            Cancel
          </button>
          <button className={`${button} w-full sm:w-auto justify-center`} disabled={saving || !verified || !id}>
            {saving ? 'Saving…' : 'Confirm payment'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
