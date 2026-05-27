import { useState } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";

import {useUser} from "../../context/users/useUser.js"

export default function Sidebar() {

  const { clearUser } = useUser();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { t, language, setLanguage } = useTranslation();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false)
  };
  const handleLogout = () => {
        clearUser();
    setIsOpen(false)
  };

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-[#1E3A8A] px-3 py-2 text-[#1E3A8A] bg-white shadow-sm"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 bg-black/30 z-30
          transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Sidebar */}
<aside
className={`
  fixed inset-y-0 left-0 z-40
  flex flex-col bg-white
  overflow-hidden
    border-r border-gray-200
    ${isMobile ? "w-full" : "w-56"}
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>
{/* Header */}
<div className="border-b border-gray-200 px-5 py-6 text-center">
  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
    {t("nav.store_label")}
  </p>

  <h2 className="mt-2 text-lg font-semibold leading-snug text-[#1E3A8A] break-words">
    {user?.store_name || "Utang App"}
  </h2>

  {user?.email && (
    <p className="mt-1 text-xs text-gray-500 break-words">
      {user.email}
    </p>
  )}
</div>

        {/* Navigation */}
<nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          <Link to={"/dashboard"} onClick={handleClose}>
            <SidebarItem label={t("nav.dashboard")} active={location.pathname === "/dashboard"} />
          </Link>
          <Link to={"/borrowers"} onClick={handleClose}>
            <SidebarItem label={t("nav.borrowers")} active={location.pathname.startsWith("/borrowers")} />
          </Link>
          <Link to={"/products"} onClick={handleClose}>
            <SidebarItem label={t("nav.products")} active={location.pathname === "/products"} />
          </Link>
        </nav>

        {/* Language Toggle */}
        <div className="px-3 pb-2 border-t border-gray-200 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2 text-center">{t("lang.label")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                language === "en"
                  ? "bg-[#1E3A8A] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("lang.en")}
            </button>
            <button
              onClick={() => setLanguage("fil")}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                language === "fil"
                  ? "bg-[#1E3A8A] text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("lang.fil")}
            </button>
          </div>
        </div>

        {/* Logout (bottom) */}
        <div className="p-3">
          <Link
            to={"/"}
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-3 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6B] text-center transition"
          >
            {t("nav.logout")}
          </Link>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition cursor-pointer ${
      active
        ? "bg-[#1E3A8A] text-white"
        : "text-gray-700 hover:bg-[#F3F4F6] hover:text-[#1E3A8A]"
    }`}>
      <span>{label}</span>
    </div>
  );
}