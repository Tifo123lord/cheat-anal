import { create } from 'zustand';
import { must, sb } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';

interface AdminOrdersState {
  orders: Order[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
}

/** Every order on the server; row-level security only lets admins read them all. */
export const useAdminOrders = create<AdminOrdersState>()((set) => ({
  orders: [],
  loading: false,
  error: '',
  load: async () => {
    set({ loading: true, error: '' });
    try {
      const rows = must(
        await sb().from('orders').select('data, status').order('created_at', { ascending: false }),
      ) as { data: Order; status: OrderStatus }[];
      set({ orders: rows.map((r) => ({ ...r.data, status: r.status })) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not load orders' });
    } finally {
      set({ loading: false });
    }
  },
  setStatus: async (id, status) => {
    must(await sb().from('orders').update({ status }).eq('id', id).select('id').single());
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
  },
}));
