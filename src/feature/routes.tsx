import { Route } from "react-router-dom";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

import DashboardPage from "./dashboard/pages/DashboardPage";
import BorrowersPage from "./borrowers/pages/BorrowersPage";
import BorrowerDetailsPage from "./borrowers/pages/BorrowerDetailsPage";

export const featureRoutes = (
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/borrowers" element={<BorrowersPage />} />
    <Route path="/borrowers/:id" element={<BorrowerDetailsPage />} />
  </Route>
);