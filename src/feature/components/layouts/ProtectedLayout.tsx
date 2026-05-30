import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { getProfile } from "../../context/users/userApi";

export default function ProtectedLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      setIsAuthenticated(false);
      return;
    }

    // Try to verify with backend, but trust localStorage if it fails
    getProfile().then((res) => {
      if (res?.ok) {
        setIsAuthenticated(true);
      } else {
        // Cookie might not be set yet — trust localStorage
        setIsAuthenticated(true);
      }
    });
  }, []);

  // Still checking
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Not authenticated (no user in localStorage)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 lg:p-8 bg-white">
        <Outlet />
      </main>
    </div>
  );
}