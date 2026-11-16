import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  publishedProducts,
  removeRecord,
  setPublished,
  upsertRecord,
  type AdminRecord,
} from '@/lib/admin-products';
import { setExtraProducts } from '@/lib/catalog';
import type { Product } from '@/lib/types';
import { browserStorage } from './storage';

interface AdminCatalogState {
  records: AdminRecord[];
  save: (r: AdminRecord) => void;
  remove: (id: string) => void;
  publish: (id: string, published: boolean) => void;
}

/** Product metadata in localStorage; the files and uploaded images themselves live in IndexedDB. */
export const useAdminCatalog = create<AdminCatalogState>()(
  persist(
    (set) => ({
      records: [],
      save: (r) => set((s) => ({ records: upsertRecord(s.records, r) })),
      remove: (id) => set((s) => ({ records: removeRecord(s.records, id) })),
      publish: (id, published) => set((s) => ({ records: setPublished(s.records, id, published) })),
    }),
    { name: 'leafpress-admin-catalog', storage: browserStorage, skipHydration: true },
  ),
);

const sync = (records: AdminRecord[]): void =>
  setExtraProducts(
    records.map((r) => r.product),
    publishedProducts(records),
  );
sync(useAdminCatalog.getState().records);
useAdminCatalog.subscribe((s) => sync(s.records));

const EMPTY: Product[] = [];
let lastRecords: AdminRecord[] | null = null;
let lastPublished: Product[] = EMPTY;

/** Published admin products; re-renders the caller whenever the admin catalogue changes. */
export function usePublishedAdminProducts(): Product[] {
  return useAdminCatalog((s) => {
    if (s.records !== lastRecords) {
      lastRecords = s.records;
      lastPublished = publishedProducts(s.records);
    }
    return lastPublished;
  });
}

export const featuredAdminProducts = (records: AdminRecord[]): Product[] =>
  records.filter((r) => r.published && r.featured).map((r) => r.product);
