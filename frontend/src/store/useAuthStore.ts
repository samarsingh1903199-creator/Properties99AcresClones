import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiUser } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'visitor' | 'dealer' | 'admin';
  verified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setAuthFromApi: (apiUser: ApiUser, token: string) => void;
  logout: () => void;
}

function mapApiUser(u: ApiUser): User {
  return {
    id:       u._id,
    email:    u.email,
    name:     u.name,
    phone:    u.phone,
    role:     u.role,
    verified: u.verified,
    avatar:   `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setAuthFromApi: (apiUser, token) => set({ user: mapApiUser(apiUser), token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
