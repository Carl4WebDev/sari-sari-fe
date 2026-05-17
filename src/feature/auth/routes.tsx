import { Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export const authRoutes = (
  <>
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </>
);
