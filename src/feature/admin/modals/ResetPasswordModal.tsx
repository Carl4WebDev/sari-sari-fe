import { useEffect, useRef, useState } from 'react';
import { adminRequest } from '../api';
import type { ManagedCustomer } from '../api';

const inputStyle =
  'w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400';
const primaryButton =
  'w-full sm:w-auto rounded-2xl bg-blue-600 px-4 py-3 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2';

interface Props {
  customer: ManagedCustomer;
  onClose: () => void;
  onSaved: () => void;
}

export default function ResetPasswordModal({ customer, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
  };

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="reset-pwd-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-5 sm:p-7 shadow-2xl backdrop:bg-slate-950/70 border-0"
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || password.length < 8) return;
          setBusy(true);
          setError('');
          try {
            await adminRequest(`/customers/${customer.user_id}/password`, 'POST', { password });
            onSaved();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to reset password.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div>
            <h2 id="reset-pwd-title" className="text-lg font-black text-slate-950 tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Set a new secure password for {customer.store_name}
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

        <fieldset disabled={busy} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                New Password
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-[11px] font-black text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                Generate Strong PW
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter at least 8 characters…"
                className={`${inputStyle} pr-16`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                {password && (
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-bold px-1"
                    title="Copy Password"
                  >
                    {copied ? (
                      <svg className="w-3.5 h-3.5 text-emerald-600 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      'Copy'
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Minimum 8 characters. Share this password securely with the store owner.
            </p>
          </div>
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
          <button disabled={busy || password.length < 8} className={primaryButton}>
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
