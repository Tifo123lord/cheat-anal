import { create } from 'zustand';
import {
  publishedProducts,
  removeRecord,
  setPublished,
  upsertRecord,
  type AdminRecord,
} from '@/lib/admin-products';
import { setExtraProducts } from '@/lib/catalog';
import { must, sb } from '@/lib/supabase';
import type { Product } from '@/lib/types';

interface Row {
  id: string;
  product: Product;
  published: boolean;
  featured: boolean;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
}

/** A row as read back: the server stamps file_updated_at itself whenever file_path changes. */
interface ReadRow extends Row {
  file_updated_at?: string | null;
}

export const rowToRecord = (r: ReadRow): AdminRecord => ({
  product: r.product,
  published: r.published,
  featured: r.featured,
  file: r.file_path
    ? {
        key: r.file_path,
        name: r.file_name ?? 'file',
        size: r.file_size ?? 0,
        type: r.file_type ?? '',
        ...(r.file_updated_at ? { updatedAt: r.file_updated_at } : {}),
      }
    : null,
});

export const recordToRow = (r: AdminRecord): Row => ({
  id: r.product.id,
  product: r.product,
  published: r.published,
  featured: r.featured,
  file_path: r.file?.key ?? null,
  file_name: r.file?.name ?? null,
  file_size: r.file?.size ?? null,
  file_type: r.file?.type ?? null,
});

interface AdminCatalogState {
  records: AdminRecord[];
  loaded: boolean;
  /** Reads products from the server (admins also get unpublished ones). */
  load: () => Promise<void>;
  save: (r: AdminRecord) => Promise<void>;
  remove: (id: string) => Promise<void>;
  publish: (id: string, published: boolean) => Promise<void>;
}

/** Products live on the server (Supabase): every visitor sees the same shop. */
export const useAdminCatalog = create<AdminCatalogState>()((set) => ({
  records: [],
  loaded: false,
  load: async () => {
    const rows = must(
      await sb().from('products').select('*').order('created_at', { ascending: false }),
    ) as ReadRow[];
    set({ records: rows.map(rowToRecord), loaded: true });
  },
  save: async (r) => {
    const row = { ...recordToRow(r), updated_at: new Date().toISOString() };
    // Read the row back so the record carries the server's file_updated_at stamp.
    const saved = must(await sb().from('products').upsert(row).select('*').single()) as ReadRow;
    const rec = rowToRecord(saved);
    set((s) => ({ records: upsertRecord(s.records, rec) }));
  },
  remove: async (id) => {
    must(await sb().from('products').delete().eq('id', id));
    set((s) => ({ records: removeRecord(s.records, id) }));
  },
  publish: async (id, published) => {
    must(await sb().from('products').update({ published }).eq('id', id));
    set((s) => ({ records: setPublished(s.records, id, published) }));
  },
}));

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

/** Published admin products; re-renders the caller whenever the catalogue changes. */
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
