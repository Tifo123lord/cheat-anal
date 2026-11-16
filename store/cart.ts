import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, LicenseType } from '@/lib/types';
import { browserStorage } from './storage';

interface CartState {
  lines: CartLine[];
  coupon: string;
  add: (line: CartLine) => void;
  remove: (kind: CartLine['kind'], id: string) => void;
  setLicense: (kind: CartLine['kind'], id: string, license: LicenseType) => void;
  setCoupon: (code: string) => void;
  clear: () => void;
  has: (kind: CartLine['kind'], id: string) => boolean;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: '',
      // One line per item: adding again just updates the licence (digital files have no quantity).
      add: (line) =>
        set((s) => ({
          lines: s.lines.some((l) => l.kind === line.kind && l.id === line.id)
            ? s.lines.map((l) => (l.kind === line.kind && l.id === line.id ? line : l))
            : [...s.lines, line],
        })),
      remove: (kind, id) => set((s) => ({ lines: s.lines.filter((l) => !(l.kind === kind && l.id === id)) })),
      setLicense: (kind, id, license) =>
        set((s) => ({ lines: s.lines.map((l) => (l.kind === kind && l.id === id ? { ...l, license } : l)) })),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ lines: [], coupon: '' }),
      has: (kind, id) => get().lines.some((l) => l.kind === kind && l.id === id),
    }),
    { name: 'leafpress-cart', storage: browserStorage, skipHydration: true },
  ),
);
