import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  const user = localStorage.getItem("user");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}