'use client';

import { useId, useState } from 'react';
import { grantProblems, UNLOCK_LABEL } from '@/lib/order-access';
import { useAdminCatalog } from '@/store/admin-catalog';
import { useAdminOrders } from '@/store/admin-orders';
import { useUI } from '@/store/ui';

/** Admin form: unlock a product's download for a registered user by email (creates a paid 'manual' order). */
export default function GrantDownload({ onGranted }: { onGranted?: () => void }) {
  const id = useId();
  const records = useAdminCatalog((s) => s.records);
  const grant = useAdminOrders((s) => s.grant);
  const toast = useUI((s) => s.toast);
  const [email, setEmail] = useState('');
  const [productId, setProductId] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; product?: string; server?: string }>({});

  const products = records.filter((r) => r.file);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs = grantProblems(email, productId);
    setErrors(errs);
    if (errs.email || errs.product) {
      document.getElementById(`${id}-${errs.email ? 'email' : 'product'}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const order = await grant(email, productId);
      toast(`دانلود «${order.items[0]?.title ?? productId}» برای ${email.trim()} باز شد (سفارش ${order.id})`);
      setEmail('');
      setProductId('');
      onGranted?.();
    } catch (ex) {
      setErrors({ server: ex instanceof Error ? ex.message : 'باز کردن دانلود انجام نشد.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby={`${id}-h`}
      className="mt-3 rounded-md border border-[#a49b82] bg-paper-light/50 p-3 text-ink"
    >
      <h3 id={`${id}-h`} className="text-[13px] font-bold">
        باز کردن دانلود برای یک کاربر
      </h3>
      <p className="text-[11px] text-ink-muted">
        ایمیل حساب کاربر را بنویس و محصول را انتخاب کن. یک سفارش «دستی» با دانلود باز برایش ساخته می‌شود و
        فایل در «دانلودهای من» او ظاهر می‌شود.
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <div>
          <label htmlFor={`${id}-email`} className="label">
            ایمیل کاربر
          </label>
          <input
            id={`${id}-email`}
            className="field"
            type="email"
            dir="ltr"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id}-email-err` : undefined}
          />
          {errors.email && (
            <p id={`${id}-email-err`} className="error-text" role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-product`} className="label">
            محصول
          </label>
          <select
            id={`${id}-product`}
            className="field"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            aria-invalid={Boolean(errors.product)}
            aria-describedby={errors.product ? `${id}-product-err` : undefined}
          >
            <option value="">انتخاب کن…</option>
            {products.map((r) => (
              <option key={r.product.id} value={r.product.id}>
                {r.product.title}
                {r.published ? '' : ' (منتشرنشده)'}
              </option>
            ))}
          </select>
          {errors.product && (
            <p id={`${id}-product-err`} className="error-text" role="alert">
              {errors.product}
            </p>
          )}
        </div>
        <button type="submit" className="btn sm:mt-[22px]" disabled={busy}>
          {busy ? 'در حال باز کردن…' : UNLOCK_LABEL}
        </button>
      </div>
      {errors.server && (
        <p className="error-text" role="alert" data-testid="grant-error">
          {errors.server}
        </p>
      )}
    </form>
  );
}
