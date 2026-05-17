import { Route } from "react-router-dom";
import ProtectedLayout from "../components/Sidebar/Sidebar";
import DashboardPage from "./pages/DashboardPage";

export const dashboardRoutes = (
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Route>
);