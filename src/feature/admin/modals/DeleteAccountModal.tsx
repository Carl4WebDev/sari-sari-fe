import { useEffect, useRef, useState } from 'react';
import { adminRequest } from '../api';
import type { ManagedCustomer } from '../api';

interface Props {
  customer: ManagedCustomer;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteAccountModal({ customer, onClose, onDeleted }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-5 sm:p-7 space-y-4 shadow-2xl backdrop:bg-slate-950/70 border-0"
    >
      <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div>
        <h2 id="delete-title" className="text-lg font-black text-slate-950 tracking-tight">
          Deactivate {customer.store_name}?
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1.5 leading-relaxed">
          This store owner will be temporarily suspended from signing in. All store utang records, transactions, and payment history will be retained safely. You can restore this account at any time.
        </p>
      </div>

      {error && <p role="alert" className="text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-xl">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 cursor-pointer transition text-center"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-2xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-600/20 transition cursor-pointer active:scale-95 disabled:opacity-50 w-full sm:w-auto text-center"
          onClick={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await adminRequest(`/customers/${customer.user_id}`, 'DELETE');
              onDeleted();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Unable to deactivate account.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Deactivating…' : 'Confirm Deactivate'}
        </button>
      </div>
    </dialog>
  );
}
