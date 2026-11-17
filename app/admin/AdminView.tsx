'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Container } from '@/components/Layout';
import { useRequireLogin } from '@/components/useRequireLogin';
import { useHydrated } from '@/store/hydration';
import AdminPassword from './AdminPassword';
import ProductManager from './ProductManager';
import ReviewQueue from './ReviewQueue';

type Tab = 'products' | 'queue' | 'password';
const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'queue', label: 'Review queue' },
  { id: 'password', label: 'Admin password' },
];

export default function AdminView() {
  const hydrated = useHydrated();
  const { user, allowed } = useRequireLogin('admin');
  const [tab, setTab] = useState<Tab>('products');

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
            Admins only
          </h1>
          <p className="text-[13px]">
            You are signed in as {user.email}, which is not an admin account.{' '}
            <Link href="/" className="link">
              Back to the shop
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
          Admin panel
        </h1>
        <p className="text-[12px] text-ink-muted">
          Signed in as {user.email}. Products and files are stored on the server, so every visitor sees
          them.
        </p>
        {user.defaultPassword && (
          <div
            role="alert"
            className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#c9a54a] bg-[#f3e6b8] p-2.5 text-[12px] text-ink"
          >
            <span>
              <strong>You are using the demo admin password.</strong> Anyone who has read the README can sign
              in with it. Please change it.
            </span>
            <button type="button" className="btn" onClick={() => setTab('password')}>
              Change password
            </button>
          </div>
        )}
        <div role="tablist" aria-label="Admin sections" className="mt-3 flex flex-wrap gap-1.5">
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
          {tab === 'products' && <ProductManager />}
          {tab === 'queue' && <ReviewQueue />}
          {tab === 'password' && <AdminPassword />}
        </div>
      </section>
    </Container>
  );
}
