import { useEffect, useRef, useState } from 'react';
import { adminRequest } from '../api';
import type { ManagedCustomer } from '../api';

const inputStyle =
  'w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400';
const primaryButton =
  'rounded-2xl bg-blue-600 px-4 py-3 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2';

interface Props {
  customer: ManagedCustomer | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AccountFormModal({ customer, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(customer?.store_name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="account-form-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl backdrop:bg-slate-950/70 border-0"
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError('');
          try {
            await adminRequest(
              customer ? `/customers/${customer.user_id}` : '/customers',
              customer ? 'PATCH' : 'POST',
              { store_name: name, email, ...(!customer ? { password } : {}) }
            );
            onSaved();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Unable to save user.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div>
            <h2 id="account-form-title" className="text-lg font-black text-slate-950 tracking-tight">
              {customer ? 'Edit Store Account' : 'Add New Store Owner'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {customer ? 'Update store name or contact email.' : 'Set up store owner login and details.'}
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

        {error && <p role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-xl">{error}</p>}

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

          {!customer && (
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
                  placeholder="••••••••"
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
                Must be at least 8 characters. Share securely with the store owner.
              </p>
            </div>
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
            {busy ? 'Saving…' : customer ? 'Save Changes' : 'Create Store Owner'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
