import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "@/src/layouts/MainLayout";
import { ROUTES } from "@/src/constants/routes";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Home } from "@/src/pages/home";
import { SpecialistsListing } from "@/src/pages/specialists/SpecialistsListing";
import { SpecialistDetails } from "@/src/pages/specialists/SpecialistDetails";
import { ProjectsListing } from "@/src/pages/projects/ProjectsListing";
import { ProjectDetails } from "@/src/pages/projects/ProjectDetails";
import { PropertiesListing } from "@/src/pages/properties/PropertiesListing";
import { PropertyDetails } from "@/src/pages/properties/PropertyDetails";
import { ProfilePage } from "@/src/pages/dashboard/ProfilePage";
import { WishlistPage } from "@/src/pages/dashboard/WishlistPage";
import { EnquiriesPage } from "@/src/pages/dashboard/EnquiriesPage";
import { LoginPage } from "@/src/pages/auth/LoginPage";
import { RegisterPage } from "@/src/pages/auth/RegisterPage";

const PagePlaceholder = ({ title }: { title: string }) => (
  <div className="min-h-screen pt-32 px-12 flex flex-col items-center justify-center">
    <h1 className="text-4xl font-display font-bold mb-4">{title}</h1>
    <p className="text-luxury-black/40">This module is under development.</p>
  </div>
);

// Redirects unauthenticated users to /login, preserving the intended destination
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.AUTH.LOGIN} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* Public routes */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.PROPERTIES} element={<PropertiesListing />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/projects" element={<ProjectsListing />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path={ROUTES.AGENTS} element={<SpecialistsListing />} />
        <Route path="/specialists/:id" element={<SpecialistDetails />} />
        <Route path={ROUTES.ABOUT} element={<PagePlaceholder title="Our Story" />} />
        <Route path={ROUTES.CONTACT} element={<PagePlaceholder title="Concierge" />} />

        {/* Auth routes (redirect to home if already logged in) */}
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH.SIGNUP} element={<RegisterPage />} />

        {/* Protected dashboard routes — require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD.ROOT} element={<ProfilePage />} />
          <Route path={ROUTES.DASHBOARD.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.DASHBOARD.SAVED} element={<WishlistPage />} />
          <Route path={ROUTES.DASHBOARD.ENQUIRIES} element={<EnquiriesPage />} />
          <Route path={ROUTES.DASHBOARD.MY_PROPERTIES} element={<PagePlaceholder title="My Properties" />} />
          <Route path={ROUTES.DASHBOARD.POST} element={<PagePlaceholder title="Post a Property" />} />
        </Route>

      </Route>
    </Routes>
  );
};
