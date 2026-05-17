import { Route } from "react-router-dom";
import PublicStatusPage from "./pages/PublicStatusPage";

import PublicRoute from "../components/layouts/PublicRoute";

import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";

export const publicRoutes = (
  <Route element={<PublicRoute />}>
    <Route path="/" element={<LoginPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/status" element={<PublicStatusPage />} />
  </Route>
);