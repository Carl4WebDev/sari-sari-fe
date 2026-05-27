import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

const DashboardPage = lazy(() => import("./dashboard/pages/DashboardPage"));
const BorrowersPage = lazy(() => import("./borrowers/pages/BorrowersPage"));
const BorrowerDetailsPage = lazy(() => import("./borrowers/pages/BorrowerDetailsPage"));
const ManageProductsPage = lazy(() => import("./products/ManageProductsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E3A8A] border-t-transparent" />
    </div>
  );
}

export const featureRoutes = (
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
    <Route path="/borrowers" element={<Suspense fallback={<PageLoader />}><BorrowersPage /></Suspense>} />
    <Route path="/products" element={<Suspense fallback={<PageLoader />}><ManageProductsPage /></Suspense>} />
    <Route path="/borrowers/:id" element={<Suspense fallback={<PageLoader />}><BorrowerDetailsPage /></Suspense>} />
  </Route>
);
