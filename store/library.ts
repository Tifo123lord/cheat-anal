import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { must, sb } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import { browserStorage } from './storage';

interface LibraryState {
  /** The signed-in buyer's orders, read from the server. */
  orders: Order[];
  freeEmail: string;
  freeDownloads: Record<string, number>;
  load: () => Promise<void>;
  clearOrders: () => void;
  addOrder: (o: Order) => Promise<void>;
  countDownload: (orderId: string, itemId: string) => void;
  unlockFree: (email: string) => void;
  countFree: (productId: string) => void;
}

const productIds = (o: Order): string[] => [
  ...new Set(o.items.filter((i) => i.kind === 'product').map((i) => i.id)),
];

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      orders: [],
      freeEmail: '',
      freeDownloads: {},
      load: async () => {
        const { data: session } = await sb().auth.getSession();
        const uid = session.session?.user.id;
        if (!uid) {
          set({ orders: [] });
          return;
        }
        const rows = must(
          await sb()
            .from('orders')
            .select('data, status, method')
            .eq('owner', uid)
            .order('created_at', { ascending: false }),
        ) as { data: Order; status: Order['status']; method: Order['method'] | null }[];
        set({ orders: rows.map((r) => ({ ...r.data, status: r.status, method: r.method ?? 'telegram' })) });
      },
      clearOrders: () => set({ orders: [] }),
      addOrder: async (o) => {
        const order: Order = { ...o, status: 'pending' };
        must(
          await sb()
            .from('orders')
            .insert({ id: o.id, data: order, product_ids: productIds(o), method: 'telegram' }),
        );
        set((s) => ({ orders: [order, ...s.orders] }));
      },
      countDownload: (orderId, itemId) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((i) => (i.id === itemId ? { ...i, downloads: i.downloads + 1 } : i)),
                }
              : o,
          ),
        }));
        const o = get().orders.find((x) => x.id === orderId);
        if (o) void sb().from('orders').update({ data: o }).eq('id', orderId);
      },
      unlockFree: (freeEmail) => set({ freeEmail }),
      countFree: (id) =>
        set((s) => ({ freeDownloads: { ...s.freeDownloads, [id]: (s.freeDownloads[id] ?? 0) + 1 } })),
    }),
    {
      name: 'leafpress-library',
      storage: browserStorage,
      skipHydration: true,
      // Orders come from the server; only the free-files unlock stays in this browser.
      partialize: (s) =>
        ({ freeEmail: s.freeEmail, freeDownloads: s.freeDownloads }) as unknown as LibraryState,
    },
  ),
);
