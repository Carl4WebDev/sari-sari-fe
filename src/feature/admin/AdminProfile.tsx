import { useState } from 'react';
import { adminRequest, endAdminSession } from './api';
import type { AdminProfileData } from './api';

const inputStyle =
  'mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400';
const buttonStyle =
  'w-full sm:w-auto rounded-2xl bg-blue-600 px-5 py-3 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2';

export default function AdminProfile({
  profile,
  onUpdate,
}: {
  profile: AdminProfileData;
  onUpdate: (profile: AdminProfileData) => void;
}) {
  const [name, setName] = useState(profile.store_name);
  const [email, setEmail] = useState(profile.email);
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const save = async (passwordChange: boolean) => {
    if (busy) return;
    setError('');
    setNotice('');
    if (passwordChange && password !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (passwordChange) {
        await adminRequest('/profile/password', 'PATCH', {
          current_password: current,
          new_password: password,
        });
        endAdminSession();
        window.location.assign('/login');
      } else {
        const updated = await adminRequest<AdminProfileData>('/profile', 'PATCH', {
          store_name: name,
          email,
          current_password: current,
        });
        onUpdate(updated);
        setCurrent('');
        setNotice('Profile successfully updated.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save changes.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white grid place-items-center text-2xl font-black shadow-md shadow-blue-600/20 shrink-0">
            {profile.store_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {profile.store_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                Administrator
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
              {profile.email}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="text-rose-700 bg-rose-50 border border-rose-200/90 p-4 rounded-2xl text-xs sm:text-sm font-bold">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="text-emerald-700 bg-emerald-50 border border-emerald-200/90 p-4 rounded-2xl text-xs sm:text-sm font-bold animate-fadeIn">
          {notice}
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
        {/* Account Details Form */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs flex flex-col justify-between">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save(false);
            }}
          >
            <div>
              <h3 className="font-black text-lg text-slate-950 tracking-tight">Account Details</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Update administrator name and contact email address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Admin Name
              </label>
              <input
                required
                maxLength={100}
                className={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                className={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Current Password (Verification)
              </label>
              <input
                autoComplete="current-password"
                type="password"
                required
                placeholder="Enter current password to save"
                className={inputStyle}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button disabled={busy} className={buttonStyle}>
                {busy ? 'Saving…' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs flex flex-col justify-between">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save(true);
            }}
          >
            <div>
              <h3 className="font-black text-lg text-slate-950 tracking-tight">Change Password</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Ensure security by using uppercase, lowercase, and digits.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className={`${inputStyle} pr-10`}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  type={showNew ? 'text' : 'password'}
                  minLength={8}
                  required
                  placeholder="Minimum 8 characters"
                  className={`${inputStyle} pr-10`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                autoComplete="new-password"
                type="password"
                minLength={8}
                required
                placeholder="Re-enter new password"
                className={inputStyle}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <p className="text-[11px] font-semibold text-slate-400">
              Updating your password will sign out all active admin sessions for security.
            </p>

            <div className="pt-2">
              <button disabled={busy} className={buttonStyle}>
                {busy ? 'Updating…' : 'Update Admin Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
