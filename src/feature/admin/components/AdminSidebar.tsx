import type { AdminProfileData } from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tab: string;
  onSelectTab: (tab: string) => void;
  profile: AdminProfileData | null;
  signingOut: boolean;
  onSignOut: () => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  tab,
  onSelectTab,
  profile,
  signingOut,
  onSignOut,
}: Props) {
  const navItems = [
    {
      id: 'Overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'Payments',
      label: 'Payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-xs lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-white w-72 max-w-[85vw] overflow-hidden border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Admin Header */}
        <div className="border-b border-slate-800/90 px-5 py-5 text-left relative bg-slate-950/70">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center border border-slate-700/60 active:scale-95 shadow-2xs"
            title="Hide Sidebar"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-400/20 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Admin Portal
            </span>
          </div>

          <div className="mt-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0 border border-blue-400/30">
              {(profile?.store_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <h2 className="text-base sm:text-lg font-black leading-tight text-white tracking-tight truncate">
                {profile?.store_name || 'ListaHub Admin'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                {profile?.email || 'admin@listahub.ph'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer text-left rounded-2xl ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 border border-blue-400/30 scale-[1.01]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 font-bold'
                }`}
              >
                <span className={`${active ? 'text-white' : 'text-slate-400'} shrink-0`}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800/90 bg-slate-950/40">
          <button
            type="button"
            disabled={signingOut}
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-300 border border-slate-700/80 hover:border-rose-500 text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-rose-400 group-hover:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
