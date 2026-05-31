import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import ConnectionStatus from "../../../shared/components/ConnectionStatus";

export default function ProtectedLayout() {
  const token = localStorage.getItem("user_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:p-6 lg:p-8 bg-white">
        <ConnectionStatus />
        <div className="p-4 md:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
