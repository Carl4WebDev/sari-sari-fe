import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useUser } from "../../context/users/useUser.js";

interface SidebarProps {
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  onOpenSubscription?: () => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
}

export default function Sidebar({ isOpenExternal, onCloseExternal, onOpenSubscription, onOpenAuth }: SidebarProps) {
  const { clearUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isDemo = localStorage.getItem("is_demo_mode") === "true";
  const userToken = localStorage.getItem("user_token");
  const isRealUser = Boolean(userToken && userToken !== "active_store_token" && !isDemo);

  let user: any = {};
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser && rawUser !== "undefined") user = JSON.parse(rawUser);
  } catch {
    user = {};
  }
  const { t, language, setLanguage } = useTranslation();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  const handleClose = () => {
    if (onCloseExternal) {
      onCloseExternal();
    } else {
      setInternalOpen(false);
    }
  };

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      handleClose();
    }
  };

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem("user_token");
    localStorage.removeItem("is_demo_mode");
    localStorage.removeItem("user");
    handleClose();
    navigate("/");
  };

  const storeDisplayName = (user?.store_name && user.store_name !== "Utang App")
    ? user.store_name
    : "ListaHub";

  return (
    <>
      {/* Overlay (mobile overlay mode only) */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-xs lg:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col bg-slate-900 text-white w-72
          overflow-hidden border-r border-slate-800 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Store Header */}
        <div className="border-b border-slate-800/90 px-5 py-5 text-left relative bg-slate-950/70">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center border border-slate-700/60 active:scale-95 shadow-2xs"
            title="Hide Sidebar"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-400/20 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("nav.store_label")}
            </span>
          </div>

          <div className="mt-3.5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0 border border-blue-400/30">
              {storeDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <h2 className="text-base sm:text-lg font-black leading-tight text-white tracking-tight truncate">
                {storeDisplayName}
              </h2>
              <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                {user?.email || "owner@listahub.ph"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items with Modern SVG Vector Icons */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          {user?.is_admin && (
            <Link to="/admin" onClick={handleNavClick} className="block">
              <SidebarItem
                label="Admin Portal"
                active={location.pathname.startsWith("/admin")}
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
            </Link>
          )}
          <Link to={"/dashboard"} onClick={handleNavClick} className="block">
            <SidebarItem
              label={t("nav.dashboard")}
              active={location.pathname === "/dashboard" && !location.search.includes("tab=")}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
            />
          </Link>
          <Link to={"/borrowers"} onClick={handleNavClick} className="block">
            <SidebarItem
              label={t("nav.borrowers")}
              active={location.pathname.startsWith("/borrowers")}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </Link>
          <Link to={"/products"} onClick={handleNavClick} className="block">
            <SidebarItem
              label={t("nav.products")}
              active={location.pathname === "/products"}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
          </Link>
          <Link to={"/profile"} onClick={handleNavClick} className="block">
            <SidebarItem
              label={t("nav.profile")}
              active={location.pathname === "/profile"}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </Link>
        </nav>

        {/* Auth / Logout Button (bottom) */}
        <div className="p-4 border-t border-slate-800/90 bg-slate-950/40">
          {!isRealUser ? (
            <button
              type="button"
              onClick={() => {
                handleClose();
                if (onOpenAuth) onOpenAuth("login");
                else navigate("/");
              }}
              className="w-full rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-blue-600/20 active:scale-[0.98] border border-blue-400/30"
            >
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>{language === "fil" ? "Mag-login / Mag-register" : "Sign In / Sign Up"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-black text-slate-300 bg-slate-800/80 hover:bg-rose-600 hover:text-white transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] border border-slate-700/80 hover:border-rose-500"
            >
              <svg className="w-4 h-4 text-rose-400 group-hover:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t("nav.logout")}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  label,
  active = false,
  icon,
  badge,
}: {
  label: string;
  active?: boolean;
  icon: React.ReactNode;
  badge?: string | number;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 border border-blue-400/30 scale-[1.01]"
          : "text-slate-400 hover:bg-slate-800/80 hover:text-white font-bold"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 truncate">
        <span className={`${active ? "text-white" : "text-slate-400 group-hover:text-white"} shrink-0`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-2xs shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}
