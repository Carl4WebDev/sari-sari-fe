import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

export default function ProtectedLayout() {
  const token = localStorage.getItem("user_token");

  if (!token) {
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
