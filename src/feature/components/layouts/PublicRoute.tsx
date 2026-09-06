import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  if (sessionStorage.getItem('listahub_admin_session')) return <Navigate to="/admin" replace />;
  const token = localStorage.getItem("user_token");
  const isDemo = localStorage.getItem("is_demo_mode") === "true";

  if (token && !isDemo && token !== "active_store_token" && token !== "demo_sandbox_token") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
