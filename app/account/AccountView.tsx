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
              علاقه‌مندی‌ها
            </h2>
            {wish.length === 0 ? (
              <EmptyState title="هنوز چیزی ذخیره نکرده‌ای">
                روی قلب هر فایل بزن تا اینجا ذخیره شود.
              </EmptyState>
            ) : (
              <div className="mt-3">
                <ProductGrid items={wish} label="علاقه‌مندی‌ها" />
              </div>
            )}
          </section>
        </div>
        <aside className="min-w-0 space-y-[14px]">
          {!user ? (
            <section className="frame on-paper p-4 text-center">
              <h1 className="page-title">حساب کاربری</h1>
              <p className="mt-1 text-[13px] text-ink">
                برای مدیریت پروفایلت وارد شو. علاقه‌مندی‌ها بدون حساب هم کار می‌کنند.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Link href="/login/" className="btn">
                  ورود
                </Link>
                <Link href="/register/" className="btn-ghost">
                  ثبت‌نام
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section className="frame on-paper p-4" aria-labelledby="acc-h">
                <h1 id="acc-h" className="page-title">
                  تنظیمات حساب
                </h1>
                <p className="text-[12px] text-ink-muted">
                  <bdi>{user.email}</bdi>
                </p>
                <form
                  noValidate
                  className="mt-3 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim().length < 2) return setNameErr('نام باید دست‌کم ۲ کاراکتر باشد.');
                    setNameErr('');
                    void update({ name: name.trim(), newsletter });
                    toast('پروفایل ذخیره شد');
                  }}
                >
                  <FormField
                    id="acc-name"
                    label="نام نمایشی"
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
                    خبرنامهٔ هفتگی
                  </label>
                  <button type="submit" className="btn">
                    ذخیرهٔ پروفایل
                  </button>
                </form>
              </section>
              <section className="frame on-paper p-4" aria-labelledby="pw-h">
                <h2 id="pw-h" className="widget-title">
                  تغییر رمز عبور
                </h2>
                <form
                  noValidate
                  className="mt-2 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const errs: typeof pwErr = {};
                    if (!pw.current) errs.current = 'رمز عبور فعلی را وارد کن.';
                    const nextErr = passwordProblem(pw.next);
                    if (nextErr) errs.next = nextErr;
                    if (!Object.keys(errs).length) {
                      const msg = await changePassword(pw.current, pw.next);
                      if (msg) errs.current = msg;
                    }
                    setPwErr(errs);
                    if (!Object.keys(errs).length) {
                      setPw({ current: '', next: '' });
                      toast('رمز عبور به‌روز شد');
                    }
                  }}
                >
                  <FormField
                    id="pw-cur"
                    label="رمز عبور فعلی"
                    type="password"
                    autoComplete="current-password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    error={pwErr.current}
                  />
                  <FormField
                    id="pw-new"
                    label="رمز عبور جدید"
                    type="password"
                    autoComplete="new-password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    error={pwErr.next}
                  />
                  <button type="submit" className="btn-olive">
                    به‌روزرسانی رمز عبور
                  </button>
                </form>
              </section>
              <section className="frame on-paper space-y-2 p-4">
                <p className="text-[12px] text-ink">
                  {orders.length} سفارش ·{' '}
                  <Link href="/library/" className="link">
                    دانلودهای من
                  </Link>{' '}
                  ·{' '}
                  <Link href="/dashboard/" className="link">
                    داشبورد سازنده
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
                  خروج
                </button>
              </section>
            </>
          )}
        </aside>
      </div>
    </Container>
  );
}
