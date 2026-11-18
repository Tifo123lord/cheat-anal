'use client';

import { useState } from 'react';
import { findCoupon } from '@/lib/pricing';
import { useCart } from '@/store/cart';

export default function CouponForm() {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  if (coupon) {
    return (
      <p className="flex items-center justify-between gap-2 text-[12px] text-ink" role="status">
        <span>
          کد تخفیف <strong>{coupon}</strong> اعمال شد.
        </span>
        <button type="button" className="link" onClick={() => setCoupon('')}>
          حذف
        </button>
      </p>
    );
  }
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const c = findCoupon(code);
        if (!c) {
          setError(code.trim() ? 'این کد معتبر نیست. LEAF15 را امتحان کن.' : 'کد تخفیف را وارد کن.');
          return;
        }
        setError('');
        setCoupon(c.code);
        setCode('');
      }}
    >
      <label htmlFor="coupon" className="label">
        کد تخفیف
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          className="field !py-1.5 uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'coupon-err' : 'coupon-hint'}
          placeholder="LEAF15"
        />
        <button type="submit" className="btn-olive shrink-0">
          اعمال
        </button>
      </div>
      {error ? (
        <p id="coupon-err" className="error-text">
          {error}
        </p>
      ) : (
        <p id="coupon-hint" className="mt-1 text-[11px] text-ink-muted">
          نکته: کد LEAF15 پانزده درصد تخفیف می‌دهد.
        </p>
      )}
    </form>
  );
}
