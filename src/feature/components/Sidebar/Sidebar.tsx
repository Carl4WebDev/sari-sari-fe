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

  return (
    <>
      {/* Overlay (mobile overlay mode only) */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-xs lg:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col bg-slate-900 text-white w-80 sm:w-88
          overflow-hidden border-r border-slate-800 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Store Header */}
        <div className="border-b border-slate-800 px-6 py-6 text-left relative bg-slate-950/60">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center border border-slate-700/60 active:scale-95"
            title="Hide Sidebar"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2.5 pr-8">
            <p className="text-xs font-black uppercase tracking-wider text-blue-400">
              {t("nav.store_label")}
            </p>
            <button
              onClick={() => {
                handleNavClick();
                if (onOpenSubscription) onOpenSubscription();
                else navigate("/profile");
              }}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:brightness-110 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs border border-amber-300/50 shrink-0 cursor-pointer transition active:scale-95"
              title="Listahub Subscription Plans"
            >
              <svg className="w-3.5 h-3.5 text-amber-100 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
              PREMIUM
            </button>
          </div>

          <h2 className="mt-2 text-lg sm:text-xl font-black leading-snug text-white break-words">
            {user?.store_name || "Utang App"}
          </h2>

          {user?.email && (
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-400 break-words">
              {user.email}
            </p>
          )}
        </div>

        {/* Navigation Items with SVG Vector Icons */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          <Link to={"/dashboard"} onClick={handleNavClick}>
            <SidebarItem
              label={t("nav.dashboard")}
              active={location.pathname === "/dashboard"}
              icon={
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
            />
          </Link>
          <Link to={"/borrowers"} onClick={handleNavClick}>
            <SidebarItem
              label={t("nav.borrowers")}
              active={location.pathname.startsWith("/borrowers")}
              icon={
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </Link>
          <Link to={"/products"} onClick={handleNavClick}>
            <SidebarItem
              label={t("nav.products")}
              active={location.pathname === "/products"}
              icon={
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
          </Link>
          <Link to={"/profile"} onClick={handleNavClick}>
            <SidebarItem
              label={t("nav.profile")}
              active={location.pathname === "/profile"}
              icon={
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </Link>
        </nav>

        {/* Language Toggle */}
        <div className="px-4 pb-4 border-t border-slate-800 pt-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 text-center">{t("lang.label")}</p>
          <div className="flex gap-2.5">
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t("lang.en")}
            </button>
            <button
              onClick={() => setLanguage("fil")}
              className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                language === "fil"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t("lang.fil")}
            </button>
          </div>
        </div>

        {/* Auth / Logout Button (bottom) */}
        <div className="p-4 border-t border-slate-800">
          {!isRealUser ? (
            <button
              onClick={() => {
                handleClose();
                if (onOpenAuth) onOpenAuth("login");
                else navigate("/");
              }}
              className="w-full rounded-2xl px-4 py-3.5 text-sm sm:text-base font-black text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-md border border-blue-400/30 active:scale-95"
            >
              <svg className="w-5 h-5 text-blue-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>{language === "fil" ? "Mag-login / Mag-register" : "Sign In / Sign Up"}</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl px-4 py-3.5 text-sm sm:text-base font-black text-slate-200 bg-slate-800 hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

function SidebarItem({ label, active = false, icon }: { label: string; active?: boolean; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-black transition cursor-pointer ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}