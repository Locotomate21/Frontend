    // src/store/authStore.ts
    import { create } from 'zustand';

    interface AuthState {
    token: string | null;
    email: string | null;
    role: string | null;
    fullName: string | null;
    setAuth: (authData: { token: string; email: string; role: string; fullName: string }) => void;
    logout: () => void;
    }

    export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    email: null,
    role: null,
    fullName: null,
    setAuth: ({ token, email, role, fullName }) => set({ token, email, role, fullName }),
    logout: () => set({ token: null, email: null, role: null, fullName: null }),
    }));
