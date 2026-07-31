import { create } from "zustand";
import { getToken, setToken, clearToken } from "@/lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => void;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  isHydrated: false,

  hydrate() {
    set({ isAuthenticated: !!getToken(), isHydrated: true });
  },

  login(token: string) {
    setToken(token);
    set({ isAuthenticated: true });
  },

  logout() {
    clearToken();
    set({ isAuthenticated: false });
  },
}));
