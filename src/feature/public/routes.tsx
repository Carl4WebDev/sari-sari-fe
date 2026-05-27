import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import PublicRoute from "../components/layouts/PublicRoute";

const LoginPage = lazy(() => import("../auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../auth/pages/RegisterPage"));
const PublicStatusPage = lazy(() => import("./pages/PublicStatusPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E3A8A] border-t-transparent" />
    </div>
  );
}

export const publicRoutes = (
  <>
    <Route element={<PublicRoute />}>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
      <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
    </Route>

    <Route path="/status/:token" element={<Suspense fallback={<PageLoader />}><PublicStatusPage /></Suspense>} />
  </>
);
