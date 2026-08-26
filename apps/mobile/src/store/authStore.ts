import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
  // saveSession guarda access + refresh token para que Supabase pueda renovar automáticamente
  saveSession: (accessToken: string, refreshToken: string, user: CurrentUser) => Promise<void>;
  loadStoredSession: () => Promise<{ accessToken: string; refreshToken: string } | null>;
}

const KEY_TOKEN   = 'tizon_access_token';
const KEY_REFRESH = 'tizon_refresh_token';
const KEY_USER    = 'tizon_auth_user';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: async (user) => {
    set({ user });
    if (user) {
      await SecureStore.setItemAsync(KEY_USER, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(KEY_USER);
    }
  },

  setToken: (token) => set({ token }),

  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)     => set({ error }),

  // Guarda sesión completa (access + refresh) en SecureStore
  saveSession: async (accessToken, refreshToken, user) => {
    set({ token: accessToken, user });
    await Promise.all([
      SecureStore.setItemAsync(KEY_TOKEN,   accessToken),
      SecureStore.setItemAsync(KEY_REFRESH, refreshToken),
      SecureStore.setItemAsync(KEY_USER,    JSON.stringify(user)),
    ]);
  },

  // Carga sesión guardada para restaurarla en Supabase al iniciar
  loadStoredSession: async () => {
    try {
      const [accessToken, refreshToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(KEY_TOKEN),
        SecureStore.getItemAsync(KEY_REFRESH),
        SecureStore.getItemAsync(KEY_USER),
      ]);
      if (accessToken && refreshToken && storedUser) {
        set({ token: accessToken, user: JSON.parse(storedUser) });
        return { accessToken, refreshToken };
      }
    } catch (e) {
      console.error('Error loading stored session:', e);
    }
    return null;
  },

  logout: async () => {
    set({ user: null, token: null });
    await Promise.all([
      SecureStore.deleteItemAsync(KEY_TOKEN),
      SecureStore.deleteItemAsync(KEY_REFRESH),
      SecureStore.deleteItemAsync(KEY_USER),
    ]);
  },
}));
