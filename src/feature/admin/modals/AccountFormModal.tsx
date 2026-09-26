import { useEffect, useRef, useState } from 'react';
import { adminRequest } from '../api';
import { subscriptionRequest, money } from '../../subscription/api';
import type { ManagedCustomer } from '../api';

const inputStyle =
  'w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400';
const selectStyle =
  'w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900';
const primaryButton =
  'rounded-2xl bg-blue-600 px-4 py-3 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2';

interface Props {
  customer: ManagedCustomer | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AccountFormModal({ customer, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const isEdit = !!customer;

  // Account fields
  const [name, setName] = useState(customer?.store_name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Payment fields (only for new accounts)
  const [plan, setPlan] = useState<'free' | 'premium'>('premium');
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'account' | 'payment'>(isEdit ? 'account' : 'account');

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const premiumRate = 299;
  const amount = duration === 12
    ? Math.round(premiumRate * 12 * 0.9 * 100) / 100
    : premiumRate * duration;

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    // If creating new + premium, go to payment step
    if (!isEdit && plan === 'premium') {
      setStep('payment');
      return;
    }

    // If creating new + free, just create account
    await createAccount();
  };

  const createAccount = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await adminRequest<{ user_id: number }>(
        customer ? `/customers/${customer.user_id}` : '/customers',
        customer ? 'PATCH' : 'POST',
        { store_name: name, email, ...(!customer ? { password } : {}) }
      );

      // If new premium account, record payment
      if (!isEdit && plan === 'premium') {
        const userId = (result as any).user_id;
        await subscriptionRequest('/admin/payments', {
          user_id: userId,
          plan: 'premium',
          duration,
          amount,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          reference_number: referenceNumber,
          notes,
        });
      }

      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save account.');
      setStep('account'); // Go back to account step on error
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="account-form-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl backdrop:bg-slate-950/70 border-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 id="account-form-title" className="text-lg font-black text-slate-950 tracking-tight">
            {isEdit ? 'Edit Store Account' : step === 'account' ? 'Create Customer Account' : 'Payment Details'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {isEdit
              ? 'Update store name or contact email.'
              : step === 'account'
                ? 'Enter the customer\'s store information and login credentials.'
                : 'Record the customer\'s Premium payment.'}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-black transition cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Step Indicator (new accounts only) */}
      {!isEdit && (
        <div className="flex items-center gap-2 mt-4">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 'account' ? 'text-blue-600' : 'text-emerald-600'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${step === 'account' ? 'bg-blue-600' : 'bg-emerald-600'}`}>1</span>
            Account
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 'payment' ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            Payment
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-xl mt-3">{error}</p>}

      {/* Step 1: Account Details */}
      {step === 'account' && (
        <form className="space-y-4 mt-4" onSubmit={handleAccountSubmit}>
          <fieldset disabled={busy} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Store / Merchant Name
              </label>
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aling Nena Sari-Sari Store"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                maxLength={255}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                className={inputStyle}
              />
            </div>

            {!isEdit && (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Password
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Temporary password for the customer"
                      className={`${inputStyle} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">
                    Customer will be advised to change this after first login.
                  </p>
                </div>

                {/* Plan Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlan('free')}
                      className={`rounded-2xl border-2 p-3 text-center transition cursor-pointer ${
                        plan === 'free'
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">Free</div>
                      <div className="text-xs text-slate-500">Local storage only</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlan('premium')}
                      className={`rounded-2xl border-2 p-3 text-center transition cursor-pointer ${
                        plan === 'premium'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">Premium</div>
                      <div className="text-xs text-amber-600 font-bold">₱299/month</div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </fieldset>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition text-center"
            >
              Cancel
            </button>
            <button disabled={busy} className={`${primaryButton} w-full sm:w-auto justify-center`}>
              {isEdit ? 'Save Changes' : plan === 'premium' ? 'Next: Payment Details' : 'Create Account'}
              {!isEdit && plan === 'premium' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Payment Details */}
      {step === 'payment' && !isEdit && (
        <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); createAccount(); }}>
          <fieldset disabled={busy} className="space-y-3.5">
            {/* Account Summary */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Store</span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Email</span>
                <span className="font-bold text-slate-900">{email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Plan</span>
                <span className="font-bold text-amber-600">Premium</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Subscription Duration
              </label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={selectStyle}>
                <option value={1}>1 month — {money(299)}</option>
                <option value={3}>3 months — {money(299 * 3)}</option>
                <option value={6}>6 months — {money(299 * 6)}</option>
                <option value={12}>12 months — {money(3229.20)} (Save 10%)</option>
              </select>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200/60 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-amber-800">Total Amount</span>
              <span className="text-lg font-black text-amber-900">{money(amount)}</span>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectStyle}>
                <option>GCash</option>
                <option>Maya</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. GCash ref # or receipt #"
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Notes <span className="text-slate-400 font-semibold normal-case">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional notes about this payment..."
                className={`${inputStyle} resize-none`}
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">I have verified this payment and confirmed it with the customer.</span>
            </label>
          </fieldset>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setStep('account')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition text-center"
            >
              Back
            </button>
            <button
              disabled={busy || !verified}
              className={`${primaryButton} w-full sm:w-auto justify-center`}
            >
              {busy ? (
                'Creating Account…'
              ) : (
                <>
                  Create Account & Activate Premium
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}