'use client';

import { create } from 'zustand';
import { useAdminCatalog } from './admin-catalog';
import { useAuth } from './auth';
import { useCart } from './cart';
import { useLibrary } from './library';
import { useReviews } from './reviews';
import { useStudio } from './studio';
import { useWishlist } from './wishlist';

interface HydrationState {
  hydrated: boolean;
  done: () => void;
}

export const useHydration = create<HydrationState>()((set) => ({
  hydrated: false,
  done: () => set({ hydrated: true }),
}));

/** True once persisted stores have been read from localStorage (always false during static render). */
export const useHydrated = (): boolean => useHydration((s) => s.hydrated);

export async function rehydrateAll(): Promise<void> {
  await Promise.all(
    [useAdminCatalog, useCart, useWishlist, useLibrary, useReviews, useAuth, useStudio].map((s) =>
      s.persist.rehydrate(),
    ),
  );
  useHydration.getState().done();
}
