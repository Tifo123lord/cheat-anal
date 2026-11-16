import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { browserStorage } from './storage';

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: 'leafpress-wishlist', storage: browserStorage, skipHydration: true },
  ),
);
