import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthData = {
  token: string | null;
  email: string | null;
  role: string | null;
  fullName: string | null;
  floor?: number | null;
};

type AuthState = {
  auth: AuthData;
  setAuth: (data: AuthData) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        token: null,
        email: null,
        role: null,
        fullName: null,
        floor: null,
      },

      setAuth: (data) => {
        set({ auth: data });
      },

      logout: () => {
        set({
          auth: {
            token: null,
            email: null,
            role: null,
            fullName: null,
            floor: null,
          },
        });
      },
    }),
    {
      name: "auth-storage", // clave en localStorage
    }
  )
);