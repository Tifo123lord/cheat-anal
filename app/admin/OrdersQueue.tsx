'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { formatDate, money2 } from '@/lib/format';
import { licenseLabel } from '@/lib/i18n';
import type { OrderStatus } from '@/lib/types';
import { useAdminOrders } from '@/store/admin-orders';
import { useUI } from '@/store/ui';

const TABS: OrderStatus[] = ['pending', 'paid', 'cancelled'];
const LABEL: Record<OrderStatus, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت‌شده',
  cancelled: 'لغوشده',
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
        status === 'paid'
          ? `سفارش ${id} پرداخت‌شده علامت خورد و دانلودها باز شد`
          : `سفارش ${id}: ${LABEL[status]}`,
      );
    } catch (e) {
      toast(`به‌روزرسانی ${id} انجام نشد: ${e instanceof Error ? e.message : 'خطای سرور'}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-labelledby="oq-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="oq-h" className="widget-title">
          سفارش‌ها
        </h2>
        <button type="button" className="btn-ghost" onClick={() => void load()} disabled={loading}>
          {loading ? 'در حال بارگذاری…' : 'تازه‌سازی'}
        </button>
      </div>
      <p className="text-[12px] text-ink-muted">
        خریدارها در تلگرام به تو پرداخت می‌کنند. وقتی پول رسید، شمارهٔ سفارششان را اینجا پیدا کن و آن را
        پرداخت‌شده علامت بزن.
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
          جست‌وجوی سفارش‌ها
        </label>
        <input
          id="oq-search"
          className="field !w-auto flex-1 !py-1.5"
          placeholder="شمارهٔ سفارش یا ایمیل"
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
        <EmptyState title={`سفارش «${LABEL[tab]}» وجود ندارد`}>
          {tab === 'pending' ? 'سفارش‌های جدید تلگرامی اینجا نمایش داده می‌شوند.' : 'فعلاً چیزی اینجا نیست.'}
        </EmptyState>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((o) => (
            <li key={o.id} className="rounded-md border border-[#a49b82] bg-paper-light/50 p-3 text-ink">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold">
                    <bdi data-testid="admin-order-id">{o.id}</bdi> · {money2(o.total)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    <bdi>{o.name}</bdi> · <bdi>{o.email}</bdi> · {formatDate(o.createdAt)}
                  </p>
                  <ul className="mt-1 text-[12px]">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        <bdi>{i.title}</bdi>{' '}
                        <span className="text-ink-muted">({licenseLabel(i.license)})</span> ·{' '}
                        {money2(i.price)}
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
                      پرداخت‌شده
                    </button>
                  )}
                  {o.status === 'pending' && (
                    <button
                      type="button"
                      className="btn-ghost !border-sale !text-[#9e2f19]"
                      disabled={busy === o.id}
                      onClick={() => void change(o.id, 'cancelled')}
                    >
                      لغو
                    </button>
                  )}
                  {o.status === 'paid' && (
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={busy === o.id}
                      onClick={() => void change(o.id, 'pending')}
                    >
                      برگرداندن
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
