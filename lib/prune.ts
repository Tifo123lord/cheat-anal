import { isRetiredSeedId } from './catalog';
import type { CartLine, Order, Review } from './types';

/**
 * The 36 seeded files (ids p01–p36) and the 4 bundles built from them were removed. Browsers that used the
 * old demo can still hold them in the cart, wishlist, library, reviews or free-download counts; these helpers
 * drop those entries so nothing points at a missing product. Admin uploads (adm-…) are never touched.
 */
export const isRetiredLine = (
  l: Pick<CartLine, 'kind' | 'id'>,
  bundleExists: (id: string) => boolean,
): boolean => (l.kind === 'bundle' ? !bundleExists(l.id) : isRetiredSeedId(l.id));

export const pruneCartLines = (lines: CartLine[], bundleExists: (id: string) => boolean): CartLine[] =>
  lines.filter((l) => !isRetiredLine(l, bundleExists));

export const pruneIds = (ids: string[]): string[] => ids.filter((id) => !isRetiredSeedId(id));

/** Removes retired items from each order and drops orders left with no items. */
export const pruneOrders = (orders: Order[], bundleExists: (id: string) => boolean): Order[] =>
  orders
    .map((o) => ({ ...o, items: o.items.filter((i) => !isRetiredLine(i, bundleExists)) }))
    .filter((o) => o.items.length > 0);

export const pruneReviews = (reviews: Review[]): Review[] =>
  reviews.filter((r) => !isRetiredSeedId(r.productId));

export const pruneCounts = (counts: Record<string, number>): Record<string, number> =>
  Object.fromEntries(Object.entries(counts).filter(([id]) => !isRetiredSeedId(id)));
