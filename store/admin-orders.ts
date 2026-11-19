import { create } from 'zustand';
import { must, sb } from '@/lib/supabase';
import type { Order, OrderMethod, OrderStatus } from '@/lib/types';

interface AdminOrdersState {
  orders: Order[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
  /** Unlocks a product's download for a registered user (a paid order with method 'manual'). */
  grant: (email: string, productId: string) => Promise<Order>;
}

interface OrderRow {
  data: Order;
  status: OrderStatus;
  method: OrderMethod | null;
}

export const rowToOrder = (r: OrderRow): Order => ({
  ...r.data,
  status: r.status,
  method: r.method ?? 'telegram',
});

/** Every order on the server; row-level security only lets admins read them all. */
export const useAdminOrders = create<AdminOrdersState>()((set) => ({
  orders: [],
  loading: false,
  error: '',
  load: async () => {
    set({ loading: true, error: '' });
    try {
      const rows = must(
        await sb().from('orders').select('data, status, method').order('created_at', { ascending: false }),
      ) as OrderRow[];
      set({ orders: rows.map(rowToOrder) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'بارگذاری سفارش‌ها انجام نشد' });
    } finally {
      set({ loading: false });
    }
  },
  setStatus: async (id, status) => {
    must(await sb().from('orders').update({ status }).eq('id', id).select('id').single());
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
  },
  grant: async (email, productId) => {
    const data = must(
      await sb().rpc('admin_grant_download', { p_email: email.trim(), p_product_id: productId }),
    ) as Order;
    const order = rowToOrder({ data, status: 'paid', method: 'manual' });
    set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] }));
    return order;
  },
}));
