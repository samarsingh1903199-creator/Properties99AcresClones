import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import { useAuthStore } from "./store/useAuthStore";
import { DashboardLayout } from "./layouts/DashboardLayout";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { PropertiesPage } from "./pages/properties/PropertiesPage";
import { AddPropertyPage } from "./pages/properties/AddPropertyPage";
import { EditPropertyPage } from "./pages/properties/EditPropertyPage";
import { InquiriesPage } from "./pages/inquiries/InquiriesPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROPERTIES} element={<PropertiesPage />} />
        <Route path={ROUTES.PROPERTY_ADD} element={<AddPropertyPage />} />
        <Route path="/properties/:id/edit" element={<EditPropertyPage />} />
        <Route path={ROUTES.INQUIRIES} element={<InquiriesPage />} />
        <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
