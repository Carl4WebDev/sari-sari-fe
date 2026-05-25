import { useState } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Link } from "react-router-dom";

import {useUser} from "../../context/users/useUser.js"

export default function Sidebar() {

  const { clearUser } = useUser();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
    fixed top-0 left-0 z-40
    h-screen overflow-y-auto flex flex-col bg-white
    border-r border-gray-200
    ${isMobile ? "w-full" : "w-56"}
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>
{/* Header */}
<div className="border-b border-gray-200 px-5 py-6 text-center">
  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
    Store
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
        <nav className="flex-1 px-3 py-6 space-y-2">
          <Link to={"/dashboard"} onClick={handleClose}>
            <SidebarItem label="Dashboard" />
          </Link>
          <Link to={"/borrowers"} onClick={handleClose}>
            <SidebarItem label="Borrowers" />
          </Link>
          <Link to={"/products"} onClick={handleClose}>
            <SidebarItem label="Manage Products" />
          </Link>
        </nav>

        {/* Logout (bottom) */}
        <div className="p-3 border-t border-gray-200">
          <Link
            to={"/"}
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-3 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172E6B] text-center transition"
          >
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ label }) {
  return (
    <div className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-[#F3F4F6] hover:text-[#1E3A8A] transition cursor-pointer">
      <span>{label}</span>
    </div>
  );
}