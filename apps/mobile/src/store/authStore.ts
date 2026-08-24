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
  loadStoredAuth: () => Promise<void>;
}

const STORAGE_TOKEN_KEY = 'tizon_auth_token';
const STORAGE_USER_KEY = 'tizon_auth_user';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  setUser: async (user) => {
    set({ user });
    if (user) {
      await SecureStore.setItemAsync(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_USER_KEY);
    }
  },
  
  setToken: async (token) => {
    set({ token });
    if (token) {
      await SecureStore.setItemAsync(STORAGE_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY);
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  logout: async () => {
    set({ user: null, token: null });
    await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY);
    await SecureStore.deleteItemAsync(STORAGE_USER_KEY);
  },
  
  loadStoredAuth: async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_TOKEN_KEY),
        SecureStore.getItemAsync(STORAGE_USER_KEY),
      ]);
      
      if (storedToken && storedUser) {
        set({
          token: storedToken,
          user: JSON.parse(storedUser),
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  },
}));
