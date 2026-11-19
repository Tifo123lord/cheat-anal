'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { formatDate, money2 } from '@/lib/format';
import { licenseLabel } from '@/lib/i18n';
import { LOCK_LABEL, lockedStatus, ORDER_STATUS_LABEL as LABEL, UNLOCK_LABEL } from '@/lib/order-access';
import type { Order, OrderStatus } from '@/lib/types';
import { useAdminOrders } from '@/store/admin-orders';
import { useUI } from '@/store/ui';
import GrantDownload from './GrantDownload';

const TABS: OrderStatus[] = ['pending', 'paid', 'cancelled'];

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

  const change = async (o: Order, status: OrderStatus) => {
    const id = o.id;
    setBusy(id);
    try {
      await setStatus(id, status);
      toast(
        status === 'paid'
          ? `دانلود سفارش ${id} باز شد`
          : o.status === 'paid'
            ? `دانلود سفارش ${id} قفل شد (${LABEL[status]})`
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
        خریدارها در تلگرام به تو پرداخت می‌کنند. وقتی پول رسید، شمارهٔ سفارششان را اینجا پیدا کن و «
        {UNLOCK_LABEL}» را بزن. اگر اشتباه شد، با «{LOCK_LABEL}» دوباره قفلش کن.
      </p>
      <GrantDownload onGranted={() => setTab('paid')} />
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
                    {o.method === 'manual' && (
                      <span className="ms-1.5 rounded bg-[#e6dcc0] px-1.5 py-0.5 text-[10px] font-normal">
                        دستی
                      </span>
                    )}
                  </p>
                  {o.status === 'paid' && (
                    <p className="text-[11px] font-bold text-olive-dark" data-testid="admin-order-open">
                      {LABEL.paid}
                    </p>
                  )}
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
                      onClick={() => void change(o, 'paid')}
                    >
                      {UNLOCK_LABEL}
                    </button>
                  )}
                  {o.status === 'pending' && (
                    <button
                      type="button"
                      className="btn-ghost !border-sale !text-[#9e2f19]"
                      disabled={busy === o.id}
                      onClick={() => void change(o, 'cancelled')}
                    >
                      لغو
                    </button>
                  )}
                  {o.status === 'paid' && (
                    <button
                      type="button"
                      className="btn-ghost !border-sale !text-[#9e2f19]"
                      disabled={busy === o.id}
                      onClick={() => void change(o, lockedStatus(o))}
                    >
                      {LOCK_LABEL}
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
