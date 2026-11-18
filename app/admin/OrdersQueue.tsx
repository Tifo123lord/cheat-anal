'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { formatDate, money2 } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';
import { useAdminOrders } from '@/store/admin-orders';
import { useUI } from '@/store/ui';

const TABS: OrderStatus[] = ['pending', 'paid', 'cancelled'];
const LABEL: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function OrdersQueue() {
  const { orders, loading, error, load, setStatus } = useAdminOrders();
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState<OrderStatus>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void load();
  }, [load]);

  const q = query.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (o.status ?? 'pending') === tab &&
      (!q || o.id.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)),
  );

  const change = async (id: string, status: OrderStatus) => {
    setBusy(id);
    try {
      await setStatus(id, status);
      toast(
        status === 'paid' ? `Order ${id} marked paid: downloads are open` : `Order ${id}: ${LABEL[status]}`,
      );
    } catch (e) {
      toast(`Could not update ${id}: ${e instanceof Error ? e.message : 'server error'}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-labelledby="oq-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="oq-h" className="widget-title">
          Orders
        </h2>
        <button type="button" className="btn-ghost" onClick={() => void load()} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      <p className="text-[12px] text-ink-muted">
        Buyers pay you on Telegram. Once the money arrives, find their order number here and mark it paid.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={tab === t ? 'btn' : 'btn-ghost'}
          >
            {LABEL[t]} ({orders.filter((o) => (o.status ?? 'pending') === t).length})
          </button>
        ))}
        <label htmlFor="oq-search" className="sr-only">
          Search orders
        </label>
        <input
          id="oq-search"
          className="field !w-auto flex-1 !py-1.5"
          placeholder="Order number or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {loading && orders.length === 0 ? (
        <div className="skeleton mt-4 h-32 w-full" aria-busy="true" />
      ) : list.length === 0 ? (
        <EmptyState title={`No ${LABEL[tab].toLowerCase()} orders`}>
          {tab === 'pending' ? 'New Telegram orders show up here.' : 'Nothing here yet.'}
        </EmptyState>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((o) => (
            <li key={o.id} className="rounded-md border border-[#a49b82] bg-paper-light/50 p-3 text-ink">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold">
                    <span data-testid="admin-order-id">{o.id}</span> · {money2(o.total)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {o.name} · {o.email} · {formatDate(o.createdAt)}
                  </p>
                  <ul className="mt-1 text-[12px]">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.title} <span className="text-ink-muted">({i.license})</span> · {money2(i.price)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  {o.status !== 'paid' && (
                    <button
                      type="button"
                      className="btn"
                      disabled={busy === o.id}
                      onClick={() => void change(o.id, 'paid')}
                    >
                      Mark paid
                    </button>
                  )}
                  {o.status === 'pending' && (
                    <button
                      type="button"
                      className="btn-ghost !border-sale !text-[#9e2f19]"
                      disabled={busy === o.id}
                      onClick={() => void change(o.id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                  {o.status === 'paid' && (
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={busy === o.id}
                      onClick={() => void change(o.id, 'pending')}
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
