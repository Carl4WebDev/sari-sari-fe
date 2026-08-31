import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import { UserProvider } from "../feature/context/users/UserProvider";
import { BorrowerProvider } from "../feature/context/borrowers/BorrowerProvider";
import { LoanProvider } from "../feature/context/loans/LoanProvider";
import { PaymentProvider } from "../feature/context/payments/PaymentProvider";
import { ProductProvider } from "../feature/context/products/ProductProvider";
import { PublicStatusProvider } from "../feature/public/context/PublicStatusProvider";
import { DashboardProvider } from "../feature/context/dashboard/DashboardProvider";
import { CollectionReminderProvider } from "../feature/context/collection-reminders/CollectionReminderProvider";

import ProtectedLayout from "../feature/components/layouts/ProtectedLayout";
import PublicRoute from "../feature/components/layouts/PublicRoute";

const LandingPage = lazy(() => import("../feature/landing/pages/LandingPage"));
const DemoPage = lazy(() => import("../feature/landing/pages/DemoPage"));
const LoginPage = lazy(() => import("../feature/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../feature/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("../feature/dashboard/pages/DashboardPage"));
const BorrowersPage = lazy(() => import("../feature/borrowers/pages/BorrowersPage"));
const BorrowerDetailsPage = lazy(() => import("../feature/borrowers/pages/BorrowerDetailsPage"));
const ManageProductsPage = lazy(() => import("../feature/products/ManageProductsPage"));
const UserManagementPage = lazy(() => import("../feature/users/pages/UserManagementPage"));
const PublicStatusPage = lazy(() => import("../feature/public/pages/PublicStatusPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E3A8A] border-t-transparent" />
    </div>
  );
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <UserProvider>
      <Routes>
        {/* Public Landing & Demo Sandbox routes */}
        <Route path="/" element={<SuspenseWrap><LandingPage /></SuspenseWrap>} />
        <Route path="/demo" element={<SuspenseWrap><DemoPage /></SuspenseWrap>} />

        {/* Auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<SuspenseWrap><LoginPage /></SuspenseWrap>} />
          <Route path="/register" element={<SuspenseWrap><RegisterPage /></SuspenseWrap>} />
        </Route>

        {/* Public borrower status — own provider */}
        <Route path="/status/:token" element={
          <PublicStatusProvider>
            <SuspenseWrap><PublicStatusPage /></SuspenseWrap>
          </PublicStatusProvider>
        } />

        {/* Protected routes — all providers needed for cross-page modals */}
        <Route element={
          <DashboardProvider>
            <BorrowerProvider>
              <LoanProvider>
                <PaymentProvider>
                  <ProductProvider>
                    <CollectionReminderProvider>
                      <ProtectedLayout />
                    </CollectionReminderProvider>
                  </ProductProvider>
                </PaymentProvider>
              </LoanProvider>
            </BorrowerProvider>
          </DashboardProvider>
        }>
          <Route path="/dashboard" element={<SuspenseWrap><DashboardPage /></SuspenseWrap>} />
          <Route path="/borrowers" element={<SuspenseWrap><BorrowersPage /></SuspenseWrap>} />
          <Route path="/borrowers/:id" element={<SuspenseWrap><BorrowerDetailsPage /></SuspenseWrap>} />
          <Route path="/products" element={<SuspenseWrap><ManageProductsPage /></SuspenseWrap>} />
          <Route path="/profile" element={<SuspenseWrap><UserManagementPage /></SuspenseWrap>} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
