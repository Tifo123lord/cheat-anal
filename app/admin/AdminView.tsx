'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Container } from '@/components/Layout';
import { useRequireLogin } from '@/components/useRequireLogin';
import { useHydrated } from '@/store/hydration';
import AdminPassword from './AdminPassword';
import OrdersQueue from './OrdersQueue';
import ProductManager from './ProductManager';
import ReviewQueue from './ReviewQueue';

type Tab = 'orders' | 'products' | 'queue' | 'password';
const TABS: { id: Tab; label: string }[] = [
  { id: 'orders', label: 'سفارش‌ها' },
  { id: 'products', label: 'محصولات' },
  { id: 'queue', label: 'صف بررسی' },
  { id: 'password', label: 'رمز عبور مدیر' },
];

export default function AdminView() {
  const hydrated = useHydrated();
  const { user, allowed } = useRequireLogin('admin');
  const [tab, setTab] = useState<Tab>('orders');

  if (!hydrated || !user) {
    return (
      <Container className="mt-3 md:mt-[14px]">
        <div className="frame h-60 p-4">
          <div className="skeleton h-full w-full" aria-busy="true" />
        </div>
      </Container>
    );
  }
  if (!allowed) {
    return (
      <Container className="mt-3 md:mt-[14px]">
        <section className="frame on-paper p-5 text-ink" aria-labelledby="adm-h">
          <h1 id="adm-h" className="page-title">
            فقط برای مدیرها
          </h1>
          <p className="text-[13px]">
            با <bdi>{user.email}</bdi> وارد شده‌ای که حساب مدیر نیست.{' '}
            <Link href="/" className="link">
              بازگشت به فروشگاه
            </Link>
            .
          </p>
        </section>
      </Container>
    );
  }

  return (
    <Container className="mt-3 md:mt-[14px]">
      <section className="frame on-paper p-3 sm:p-5" aria-labelledby="adm-h">
        <h1 id="adm-h" className="page-title">
          پنل مدیریت
        </h1>
        <p className="text-[12px] text-ink-muted">
          با <bdi>{user.email}</bdi> وارد شده‌ای. محصولات و فایل‌ها روی سرور ذخیره می‌شوند و همهٔ
          بازدیدکننده‌ها آن‌ها را می‌بینند.
        </p>
        {user.defaultPassword && (
          <div
            role="alert"
            className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#c9a54a] bg-[#f3e6b8] p-2.5 text-[12px] text-ink"
          >
            <span>
              <strong>از رمز عبور نمایشی مدیر استفاده می‌کنی.</strong> هر کسی README را خوانده باشد می‌تواند
              با آن وارد شود. لطفاً عوضش کن.
            </span>
            <button type="button" className="btn" onClick={() => setTab('password')}>
              تغییر رمز عبور
            </button>
          </div>
        )}
        <div role="tablist" aria-label="بخش‌های مدیریت" className="mt-3 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`adm-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`adm-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? 'btn' : 'btn-ghost'}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`adm-panel-${tab}`} aria-labelledby={`adm-tab-${tab}`} className="mt-4">
          {tab === 'orders' && <OrdersQueue />}
          {tab === 'products' && <ProductManager />}
          {tab === 'queue' && <ReviewQueue />}
          {tab === 'password' && <AdminPassword />}
        </div>
      </section>
    </Container>
  );
}
