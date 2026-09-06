import { useEffect, useRef } from 'react';
import type { ManagedCustomer } from '../api';

interface Props {
  customer: ManagedCustomer;
  onClose: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onDeactivate: () => void;
  onViewSubscription: () => void;
}

export default function UserDetailModal({
  customer,
  onClose,
  onEdit,
  onResetPassword,
  onDeactivate,
  onViewSubscription,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 border-0 text-slate-900"
    >
      <div className="p-5 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              {customer.store_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-950 leading-tight">{customer.store_name}</h3>
                {!customer.deleted_at ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200/80">
                    Deactivated
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{customer.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-black transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Account ID</span>
            <span className="text-sm font-black text-slate-900 font-mono mt-1 block">#{customer.user_id}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Date Registered</span>
            <span className="text-sm font-black text-slate-900 mt-1 block">
              {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Subscription Records</span>
                <span className="text-xs font-medium text-slate-500 mt-0.5 block">View plan history and payment receipts</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewSubscription();
                }}
                className="text-xs font-black text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                View Subscriptions →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">Admin Quick Actions</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onEdit}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200/60"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Store Info</span>
            </button>

            <button
              type="button"
              onClick={onResetPassword}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border border-amber-200/60"
            >
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Reset Password</span>
            </button>
          </div>

          {!customer.deleted_at && (
            <button
              type="button"
              onClick={onDeactivate}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border border-rose-200/60 mt-1"
            >
              <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Deactivate Merchant Account</span>
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
