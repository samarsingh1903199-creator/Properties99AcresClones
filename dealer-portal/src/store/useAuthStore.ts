import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiUser } from "../services/api";

export type UserRole = "visitor" | "dealer" | "admin";

export interface DealerUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  company?: string;
  licenseNumber?: string;
  verified: boolean;
}

interface AuthState {
  user: DealerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: DealerUser) => void;
  setAuth: (apiUser: ApiUser, token: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<DealerUser>) => void;
}

function mapApiUser(u: ApiUser): DealerUser {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone ?? "",
    company: u.company ?? "",
    licenseNumber: u.licenseNumber ?? "",
    verified: u.verified,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /* legacy — kept for compatibility with existing pages */
      login: (user) => set({ user, isAuthenticated: true }),

      /* called after a successful API login or register */
      setAuth: (apiUser, token) =>
        set({ user: mapApiUser(apiUser), token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: "dealer-auth" }
  )
);
