export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROPERTIES: "/properties",
  HIGHLIGHTED_PROPERTIES: "/properties/highlighted",
  PROPERTY_ADD: "/properties/add",
  PROPERTY_EDIT: (id: string) => `/properties/${id}/edit`,
  PROFILE: "/profile",
  INQUIRIES: "/inquiries",
  ANALYTICS: "/analytics",
  CATEGORIES: "/categories",
} as const;
