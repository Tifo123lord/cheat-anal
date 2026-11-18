'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CartSummary from '@/components/CartSummary';
import CouponForm from '@/components/CouponForm';
import EmptyState from '@/components/EmptyState';
import { Container } from '@/components/Layout';
import { cartRows, totalsFor } from '@/lib/cart-view';
import { money } from '@/lib/format';
import { licenseLabel } from '@/lib/i18n';
import { licenseKey, orderNumber } from '@/lib/keys';
import type { Order } from '@/lib/types';
import { telegramProfile, TELEGRAM_USERNAME } from '@/lib/telegram';
import { isEmail, type Errors } from '@/lib/validation';
import TelegramIcon from '@/components/TelegramIcon';
import { useRequireLogin } from '@/components/useRequireLogin';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/hydration';
import { useLibrary } from '@/store/library';

type Field = 'name' | 'email' | 'terms';

export default function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user } = useRequireLogin();
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const addOrder = useLibrary((s) => s.addOrder);
  const rows = cartRows(lines);
  const totals = totalsFor(lines, coupon);

  const [form, setForm] = useState({ name: '', email: '', terms: false });
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): Errors<Field> => {
    const e: Errors<Field> = {};
    if (form.name.trim().length < 2) e.name = 'نامت را وارد کن.';
    if (!isEmail(form.email)) e.email = 'یک ایمیل معتبر وارد کن.';
    if (!form.terms) e.terms = 'لطفاً شرایط لایسنس را بپذیر.';
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setBusy(true);
    const id = orderNumber();
    const items = rows.map((r) => ({
      kind: r.line.kind,
      id: r.line.id,
      title: r.title,
      license: r.line.license,
      price: r.price,
      licenseKey: licenseKey(id, r.line.id, r.line.license),
      downloads: 0,
    }));
    const order: Order = {
      id,
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      coupon: totals.coupon?.code,
      email: form.email.trim(),
      name: form.name.trim(),
      ownerEmail: user?.email,
      createdAt: new Date().toISOString(),
      licenseKeys: items.map((i) => i.licenseKey),
      status: 'pending',
    };
    addOrder(order).then(
      () => {
        setPlaced(true);
        clear();
        router.push(`/checkout/success/?order=${encodeURIComponent(id)}`);
      },
      (ex: unknown) => {
        setBusy(false);
        setErrors({
          terms: `ثبت سفارش انجام نشد: ${ex instanceof Error ? ex.message : 'خطای سرور'}.`,
        });
      },
    );
  };

  const err = (k: Field) =>
    errors[k] ? (
      <p id={`co-${k}-err`} className="error-text">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: Field) => ({
    'aria-invalid': Boolean(errors[k]),
    'aria-describedby': errors[k] ? `co-${k}-err` : undefined,
  });

  if (hydrated && !user) {
    return (
      <Container className="mt-3 md:mt-[14px]">
        <div className="frame on-paper p-4 text-[13px] text-ink" role="status">
          برای خرید باید وارد حسابت شوی. در حال انتقال به صفحهٔ ورود…
        </div>
      </Container>
    );
  }

  if (hydrated && rows.length === 0 && !placed) {
    return (
      <Container className="mt-3 md:mt-[14px]">
        <div className="frame on-paper p-4">
          <EmptyState title="هنوز چیزی برای پرداخت نیست">
            سبد خریدت خالی است.{' '}
            <Link href="/shop/" className="link">
              گشتی در فروشگاه بزن
            </Link>
            .
          </EmptyState>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[630px_1fr] lg:gap-[18px]">
        <form noValidate onSubmit={submit} className="frame on-paper p-3 sm:p-4" aria-labelledby="co-h">
          <h1 id="co-h" className="page-title">
            پرداخت
          </h1>
          <p className="mb-3 text-[12px] text-ink">
            پرداخت از طریق تلگرام: سفارش را ثبت کن، در صفحهٔ بعد متن سفارش را کپی کن و آن را برای{' '}
            <a href={telegramProfile()} className="link" target="_blank" rel="noopener noreferrer" dir="ltr">
              @{TELEGRAM_USERNAME}
            </a>{' '}
            بفرست و به محض تأیید پرداخت، فایل‌ها در «دانلودهای من» برایت باز می‌شوند.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="co-name" className="label">
                نام تو
              </label>
              <input
                id="co-name"
                className="field"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                {...aria('name')}
              />
              {err('name')}
            </div>
            <div>
              <label htmlFor="co-email" className="label">
                ایمیل
              </label>
              <input
                id="co-email"
                type="email"
                className="field"
                dir="ltr"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                {...aria('email')}
              />
              {err('email')}
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-start gap-2 text-[12px] text-ink">
                <input
                  id="co-terms"
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.terms}
                  onChange={(e) => set('terms', e.target.checked)}
                  {...aria('terms')}
                />
                <span>
                  با{' '}
                  <Link href="/info/licenses/" className="link">
                    شرایط لایسنس
                  </Link>{' '}
                  و{' '}
                  <Link href="/info/refunds/" className="link">
                    سیاست بازگشت وجه
                  </Link>{' '}
                  موافقم.
                </span>
              </label>
              {err('terms')}
            </div>
          </div>
          <button type="submit" className="btn mt-4 w-full !py-2.5 !text-[14px]" disabled={busy || !hydrated}>
            <TelegramIcon size={15} />{' '}
            {busy ? 'در حال ثبت سفارش…' : `ثبت سفارش و پرداخت در تلگرام · ${money(totals.total)}`}
          </button>
          <button type="button" className="btn-ghost mt-2 w-full" disabled title="به‌زودی">
            پرداخت آنلاین با کارت (به‌زودی)
          </button>
          {Object.keys(errors).length > 0 && (
            <p className="error-text" role="alert">
              لطفاً فیلدهای مشخص‌شده را اصلاح کن.
            </p>
          )}
        </form>

        <aside className="frame on-paper h-fit space-y-3 p-3 sm:p-4" aria-label="خلاصهٔ سفارش">
          <h2 className="widget-title">سفارش تو</h2>
          {!hydrated ? (
            <div className="skeleton h-20 w-full" />
          ) : (
            <ul className="space-y-1.5 text-[12px] text-ink">
              {rows.map((r) => (
                <li key={`${r.line.kind}-${r.line.id}`} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    <bdi>{r.title}</bdi>{' '}
                    <span className="text-ink-muted">({licenseLabel(r.line.license)})</span>
                  </span>
                  <span className="shrink-0 font-semibold">{money(r.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <CouponForm />
          <CartSummary totals={totals} />
        </aside>
      </div>
    </Container>
  );
}
