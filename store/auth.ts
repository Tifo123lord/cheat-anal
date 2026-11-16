import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  changeUserPassword,
  loginUser,
  registerUser,
  SEED_USERS,
  withSeeds,
  type User,
} from '@/lib/auth-core';
import { browserStorage } from './storage';

export { ADMIN_USER, DEMO_USER, type User } from '@/lib/auth-core';

interface AuthState {
  users: User[];
  currentEmail: string | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  update: (patch: Partial<Pick<User, 'name' | 'newsletter'>>) => void;
  changePassword: (current: string, next: string) => Promise<string | null>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      currentEmail: null,
      register: async (name, email, password) => {
        const r = await registerUser(get().users, name, email, password);
        if (r.error !== undefined) return r.error;
        set({ users: r.users, currentEmail: r.user.email });
        return null;
      },
      login: async (email, password) => {
        const r = await loginUser(get().users, email, password);
        if (typeof r === 'string') return r;
        set({ currentEmail: r.email });
        return null;
      },
      logout: () => set({ currentEmail: null }),
      update: (patch) =>
        set((s) => ({ users: s.users.map((u) => (u.email === s.currentEmail ? { ...u, ...patch } : u)) })),
      changePassword: async (current, next) => {
        const email = get().currentEmail;
        if (!email) return 'Please sign in again.';
        const r = await changeUserPassword(get().users, email, current, next);
        if (typeof r === 'string') return r;
        set({ users: r });
        return null;
      },
    }),
    {
      name: 'leafpress-auth',
      version: 2,
      storage: browserStorage,
      skipHydration: true,
      // v1 stored a non-cryptographic hash: those accounts cannot be verified any more, so start fresh.
      migrate: () => ({ users: SEED_USERS, currentEmail: null }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthState>;
        const users = withSeeds(p.users ?? []);
        const currentEmail = users.some((u) => u.email === p.currentEmail) ? (p.currentEmail ?? null) : null;
        return { ...current, users, currentEmail };
      },
    },
  ),
);

export const useCurrentUser = (): User | null =>
  useAuth((s) => s.users.find((u) => u.email === s.currentEmail) ?? null);

export const useIsAdmin = (): boolean =>
  useAuth((s) => s.users.find((u) => u.email === s.currentEmail)?.role === 'admin');
