import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/lib/types';
import { browserStorage } from './storage';

interface LibraryState {
  orders: Order[];
  freeEmail: string;
  freeDownloads: Record<string, number>;
  addOrder: (o: Order) => void;
  countDownload: (orderId: string, itemId: string) => void;
  unlockFree: (email: string) => void;
  countFree: (productId: string) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      orders: [],
      freeEmail: '',
      freeDownloads: {},
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      countDownload: (orderId, itemId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((i) => (i.id === itemId ? { ...i, downloads: i.downloads + 1 } : i)),
                }
              : o,
          ),
        })),
      unlockFree: (freeEmail) => set({ freeEmail }),
      countFree: (id) =>
        set((s) => ({ freeDownloads: { ...s.freeDownloads, [id]: (s.freeDownloads[id] ?? 0) + 1 } })),
    }),
    { name: 'leafpress-library', storage: browserStorage, skipHydration: true },
  ),
);
