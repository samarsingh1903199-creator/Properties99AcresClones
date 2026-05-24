export const ROUTES = {
  HOME: '/',
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: (id: string) => `/properties/${id}`,
  SEARCH: '/search',
  AGENTS: '/agents',
  ABOUT: '/about',
  CONTACT: '/contact',
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    PROFILE: '/dashboard/profile',
    SAVED: '/dashboard/saved',
    MY_PROPERTIES: '/dashboard/my-properties',
    POST: '/dashboard/post',
    ENQUIRIES: '/dashboard/enquiries',
  },
} as const;
