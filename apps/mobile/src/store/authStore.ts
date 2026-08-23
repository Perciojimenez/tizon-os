import { create } from 'zustand';

export interface CurrentUser {
  id: string;
  email: string;
  rol: 'hostess' | 'mesero' | 'gerencia';
  nombre?: string;
}

interface AuthStore {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: CurrentUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, token: null }),
}));
