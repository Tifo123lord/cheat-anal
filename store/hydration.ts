'use client';

import { create } from 'zustand';
import { getBundle } from '@/lib/catalog';
import { pruneCartLines, pruneCounts, pruneIds, pruneOrders, pruneReviews } from '@/lib/prune';
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
  pruneRetired();
  useHydration.getState().done();
}

const bundleExists = (id: string): boolean => getBundle(id) !== undefined;

/** Drops removed seed files and bundles that older visits left in this browser's saved data. */
export function pruneRetired(): void {
  const cart = useCart.getState();
  const lines = pruneCartLines(cart.lines, bundleExists);
  if (lines.length !== cart.lines.length) useCart.setState({ lines });

  const wish = useWishlist.getState();
  const ids = pruneIds(wish.ids);
  if (ids.length !== wish.ids.length) useWishlist.setState({ ids });

  const lib = useLibrary.getState();
  const orders = pruneOrders(lib.orders, bundleExists);
  const freeDownloads = pruneCounts(lib.freeDownloads);
  const ordersChanged =
    orders.length !== lib.orders.length ||
    orders.some((o, i) => o.items.length !== lib.orders[i].items.length);
  if (ordersChanged || Object.keys(freeDownloads).length !== Object.keys(lib.freeDownloads).length)
    useLibrary.setState({ orders, freeDownloads });

  const rev = useReviews.getState();
  const reviews = pruneReviews(rev.reviews);
  if (reviews.length !== rev.reviews.length) useReviews.setState({ reviews });
}
