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

  const rate = 299;
  const amount = duration === 12
    ? Math.round(rate * 12 * 0.9 * 100) / 100
    : rate * duration;

  const handleSubmit = async () => {
    if (!id) return setError('Select a customer.');
    if (!verified) return setError('Verify the payment before proceeding.');
    setSaving(true);
    setError('');
    try {
      const result = await subscriptionRequest<{ end_date: string }>('/admin/payments', {
        user_id: Number(id),
        plan: 'premium',
        duration,
        amount,
        payment_method: method,
        payment_date: date,
        reference_number: reference,
        notes,
      });
      onSaved(result.end_date);
      dialog.current?.close();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialog} className="modal" onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white sm:rounded-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 pb-0 sm:pb-0 flex-shrink-0">
            <h2 className="text-lg font-black text-slate-900">Record Payment & Activate Premium</h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3 sm:pt-4 space-y-4">
            {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Customer</span>
              <select value={id} onChange={(e) => setId(e.target.value)} className={field}>
                <option value="">Select a customer</option>
                {data.customers.map((c) => (
                  <option key={c.user_id} value={c.user_id}>{c.store_name}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Plan</span>
              <div className={field + ' bg-slate-100 cursor-default'}>Premium — ₱299/month</div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Duration</span>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={field}>
                <option value={1}>1 month — {money(299)}</option>
                <option value={3}>3 months — {money(299 * 3)}</option>
                <option value={6}>6 months — {money(299 * 6)}</option>
                <option value={12}>12 months — {money(3229.20)} (Save 10%)</option>
              </select>
            </label>

            <div className="rounded-2xl bg-blue-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-800">Total Amount</span>
              <span className="text-lg font-black text-blue-900">{money(amount)}</span>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payment Method</span>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={field}>
                <option>GCash</option>
                <option>Maya</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payment Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={data.today} className={field} />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reference Number</span>
              <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 10029384819" className={field} />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notes (Optional)</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={field + ' resize-none'} />
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-700">I have verified this payment and confirmed it with the customer.</span>
            </label>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-4 sm:p-6 pt-0 sm:pt-0 flex-shrink-0 border-t border-slate-100 bg-white sm:bg-transparent sm:border-t-0 sm:rounded-b-3xl">
            <div className="flex gap-3 pt-3">
              <button onClick={onClose} className="flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving || !verified} className={button + ' flex-1'}>
                {saving ? 'Processing…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
