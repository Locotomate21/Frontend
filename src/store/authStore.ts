import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthData = {
  _id: string | null;  
  token: string | null;
  email: string | null;
  role: "admin" | "resident" | "president" | "secretary_general" | "representative" | "auditor" | 'floor_auditor' | 'general_auditor' | null; // 🔹 roles explícitos
  fullName: string | null;
  floor: number | null; // 🔹 siempre presente, no opcional
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
        _id: null,
        token: null,
        email: null,
        role: null,
        fullName: null,
        floor: null,
      },

      setAuth: (data) => set({ auth: data }),

      logout: () =>
        set({
          auth: {
            _id: null,
            token: null,
            email: null,
            role: null,
            fullName: null,
            floor: null,
          },
        }),
    }),
    {
      name: "auth-storage", // clave en localStorage
    }
  )
);
