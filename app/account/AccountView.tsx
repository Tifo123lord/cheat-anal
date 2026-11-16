'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import FormField from '@/components/FormField';
import { Container } from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import { getProduct } from '@/lib/catalog';
import { passwordProblem } from '@/lib/password';
import { useAuth, useCurrentUser } from '@/store/auth';
import { useHydrated } from '@/store/hydration';
import { useLibrary } from '@/store/library';
import { useUI } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';

export default function AccountView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const update = useAuth((s) => s.update);
  const changePassword = useAuth((s) => s.changePassword);
  const logout = useAuth((s) => s.logout);
  const wishIds = useWishlist((s) => s.ids);
  const allOrders = useLibrary((s) => s.orders);
  const orders = user ? allOrders.filter((o) => (o.ownerEmail ?? o.email).toLowerCase() === user.email) : [];
  const toast = useUI((s) => s.toast);
  const [name, setName] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwErr, setPwErr] = useState<{ current?: string; next?: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setNewsletter(user.newsletter);
    }
  }, [user]);

  if (!hydrated) {
    return (
      <Container className="mt-3">
        <div className="frame h-72 p-4">
          <div className="skeleton h-full w-full" aria-busy="true" />
        </div>
      </Container>
    );
  }

  const wish = wishIds.map((id) => getProduct(id)).filter((p) => p !== undefined);

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[630px_1fr] lg:gap-[18px]">
        <div className="min-w-0 space-y-[14px]">
          <section id="wishlist" className="frame on-paper p-3 sm:p-4" aria-labelledby="wl-h">
            <h2 id="wl-h" className="page-title !text-[19px]">
              Wishlist
            </h2>
            {wish.length === 0 ? (
              <EmptyState title="Nothing saved yet">Tap the heart on any file to save it here.</EmptyState>
            ) : (
              <div className="mt-3">
                <ProductGrid items={wish} label="Wishlist" />
              </div>
            )}
          </section>
        </div>
        <aside className="min-w-0 space-y-[14px]">
          {!user ? (
            <section className="frame on-paper p-4 text-center">
              <h1 className="page-title">Your account</h1>
              <p className="mt-1 text-[13px] text-ink">
                Sign in to manage your profile. Your wishlist works without an account.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Link href="/login/" className="btn">
                  Sign in
                </Link>
                <Link href="/register/" className="btn-ghost">
                  Register
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section className="frame on-paper p-4" aria-labelledby="acc-h">
                <h1 id="acc-h" className="page-title">
                  Account settings
                </h1>
                <p className="text-[12px] text-ink-muted">{user.email}</p>
                <form
                  noValidate
                  className="mt-3 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim().length < 2) return setNameErr('Name must be at least 2 characters.');
                    setNameErr('');
                    update({ name: name.trim(), newsletter });
                    toast('Profile saved');
                  }}
                >
                  <FormField
                    id="acc-name"
                    label="Display name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={nameErr}
                  />
                  <label className="flex items-center gap-2 text-[12px] text-ink">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                    />
                    Weekly newsletter
                  </label>
                  <button type="submit" className="btn">
                    Save profile
                  </button>
                </form>
              </section>
              <section className="frame on-paper p-4" aria-labelledby="pw-h">
                <h2 id="pw-h" className="widget-title">
                  Change password
                </h2>
                <form
                  noValidate
                  className="mt-2 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const errs: typeof pwErr = {};
                    if (!pw.current) errs.current = 'Enter your current password.';
                    const nextErr = passwordProblem(pw.next);
                    if (nextErr) errs.next = nextErr;
                    if (!Object.keys(errs).length) {
                      const msg = await changePassword(pw.current, pw.next);
                      if (msg) errs.current = msg;
                    }
                    setPwErr(errs);
                    if (!Object.keys(errs).length) {
                      setPw({ current: '', next: '' });
                      toast('Password updated');
                    }
                  }}
                >
                  <FormField
                    id="pw-cur"
                    label="Current password"
                    type="password"
                    autoComplete="current-password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    error={pwErr.current}
                  />
                  <FormField
                    id="pw-new"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    error={pwErr.next}
                  />
                  <button type="submit" className="btn-olive">
                    Update password
                  </button>
                </form>
              </section>
              <section className="frame on-paper space-y-2 p-4">
                <p className="text-[12px] text-ink">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} ·{' '}
                  <Link href="/library/" className="link">
                    My downloads
                  </Link>{' '}
                  ·{' '}
                  <Link href="/dashboard/" className="link">
                    Author dashboard
                  </Link>
                </p>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                >
                  Sign out
                </button>
              </section>
            </>
          )}
        </aside>
      </div>
    </Container>
  );
}
