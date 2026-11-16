'use client';

import Link from 'next/link';
import CartSummary from '@/components/CartSummary';
import CouponForm from '@/components/CouponForm';
import EmptyState from '@/components/EmptyState';
import { CloseIcon } from '@/components/Icons';
import { Container } from '@/components/Layout';
import ProductImage from '@/components/ProductImage';
import { cartRows, totalsFor } from '@/lib/cart-view';
import { money } from '@/lib/format';
import type { LicenseType } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/hydration';

export default function CartView() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const remove = useCart((s) => s.remove);
  const setLicense = useCart((s) => s.setLicense);
  const rows = cartRows(lines);
  const totals = totalsFor(lines, coupon);

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[630px_1fr] lg:gap-[18px]">
        <section className="frame on-paper p-3 sm:p-4" aria-labelledby="cart-h">
          <h1 id="cart-h" className="page-title">
            Your cart
          </h1>
          {!hydrated ? (
            <div className="mt-3 space-y-3" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="skeleton h-[72px] w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="Your cart is empty">
              Find something lovely in the{' '}
              <Link href="/shop/" className="link">
                shop
              </Link>{' '}
              or grab a{' '}
              <Link href="/free-files/" className="link">
                free file
              </Link>
              .
            </EmptyState>
          ) : (
            <ul className="mt-3 divide-y divide-[#bcb399]">
              {rows.map((r) => (
                <li
                  key={`${r.line.kind}-${r.line.id}`}
                  className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap"
                >
                  <Link
                    href={r.href}
                    className="inset-img block w-[96px] shrink-0 overflow-hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <ProductImage product={{ images: r.images, title: r.title }} alt="" sizes="96px" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={r.href}
                      className="block truncate font-serif text-[14px] font-bold text-[color:var(--link-strong)] hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="text-[11px] text-ink-muted">{r.subtitle}</p>
                    <label className="mt-1 flex items-center gap-2 text-[12px] text-ink">
                      Licence
                      <select
                        className="field !w-auto !px-2 !py-1 text-[12px]"
                        value={r.line.license}
                        onChange={(e) => setLicense(r.line.kind, r.line.id, e.target.value as LicenseType)}
                      >
                        {r.licenses.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="w-16 text-right text-[14px] font-bold text-ink">{money(r.price)}</p>
                  <button
                    type="button"
                    onClick={() => remove(r.line.kind, r.line.id)}
                    className="rounded-full p-1.5 text-ink hover:bg-paper-dark"
                    aria-label={`Remove ${r.title} from cart`}
                  >
                    <CloseIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="frame on-paper h-fit space-y-3 p-3 sm:p-4" aria-label="Order summary">
          <h2 className="widget-title">Order summary</h2>
          <CouponForm />
          <CartSummary totals={totals} />
          {hydrated && rows.length > 0 ? (
            <Link href="/checkout/" className="btn w-full !py-2">
              Proceed to checkout
            </Link>
          ) : (
            <button type="button" className="btn w-full !py-2" disabled>
              Proceed to checkout
            </button>
          )}
          <p className="text-[11px] text-ink-muted">
            Prices in USD. Tax is an estimate and is finalised at checkout.
          </p>
        </aside>
      </div>
    </Container>
  );
}
