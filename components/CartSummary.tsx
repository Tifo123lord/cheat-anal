'use client';

import { money2 } from '@/lib/format';
import { TAX_RATE, type Totals } from '@/lib/pricing';

export default function CartSummary({ totals }: { totals: Totals }) {
  return (
    <dl className="space-y-1 text-[13px] text-ink">
      <div className="flex justify-between">
        <dt>جمع جزء</dt>
        <dd>{money2(totals.subtotal)}</dd>
      </div>
      {totals.coupon && (
        <div className="flex justify-between text-[color:var(--link-strong)]">
          <dt>
            تخفیف (<bdi>{totals.coupon.code}</bdi>، {totals.coupon.percent}٪)
          </dt>
          <dd>−{money2(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>مالیات تخمینی ({Math.round(TAX_RATE * 100)}٪)</dt>
        <dd>{money2(totals.tax)}</dd>
      </div>
      <div className="flex justify-between border-t border-[#a49b82] pt-1.5 text-[16px] font-bold">
        <dt>مبلغ کل</dt>
        <dd>{money2(totals.total)}</dd>
      </div>
    </dl>
  );
}
