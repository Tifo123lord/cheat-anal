'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import { Container } from '@/components/Layout';
import { formatDate, money2 } from '@/lib/format';
import { licenseLabel } from '@/lib/i18n';
import { useHydrated } from '@/store/hydration';
import { useLibrary } from '@/store/library';

export default function InvoiceView() {
  const id = useSearchParams().get('order') ?? '';
  const hydrated = useHydrated();
  const order = useLibrary((s) => s.orders.find((o) => o.id === id));
  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="frame on-paper mx-auto max-w-[720px] p-4 sm:p-8">
        {!hydrated ? (
          <div className="skeleton h-64 w-full" aria-busy="true" />
        ) : !order ? (
          <EmptyState title="فاکتور پیدا نشد">
            <Link href="/library/" className="link">
              بازگشت به دانلودهای من
            </Link>
          </EmptyState>
        ) : (
          <article aria-labelledby="inv-h">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#a49b82] pb-3">
              <div>
                <p className="brand-wordmark text-[22px]" dir="ltr">
                  <span className="text-[#6b6754]">Cheat &amp;</span>{' '}
                  <span className="text-[color:var(--link-strong)]">Anal</span>
                </p>
                <p className="text-[11px] text-ink-muted">
                  <bdi>Cheat &amp; Anal</bdi> · خیابان گلخانه، شمارهٔ ۱ · شهر نمایشی
                </p>
              </div>
              <div className="text-end">
                <h1 id="inv-h" className="font-display text-[18px] font-bold">
                  فاکتور
                </h1>
                <p className="text-[12px]">
                  شماره: <bdi>{order.id}</bdi>
                </p>
                <p className="text-[12px]">{formatDate(order.createdAt)}</p>
              </div>
            </header>
            <p className="mt-3 text-[12px]">
              صادرشده برای <bdi className="font-bold">{order.name}</bdi> · <bdi>{order.email}</bdi>
            </p>
            <table className="mt-3 w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#a49b82] text-start">
                  <th scope="col" className="py-1.5">
                    مورد
                  </th>
                  <th scope="col" className="py-1.5">
                    لایسنس
                  </th>
                  <th scope="col" className="py-1.5 text-end">
                    مبلغ
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id} className="border-b border-[#c9c0a6]">
                    <td className="py-1.5 pe-2">
                      <bdi>{i.title}</bdi>
                      <br />
                      <span className="font-mono text-[10px] text-ink-muted" dir="ltr">
                        {i.licenseKey}
                      </span>
                    </td>
                    <td className="py-1.5">{licenseLabel(i.license)}</td>
                    <td className="py-1.5 text-end">{money2(i.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-end">
                <tr>
                  <td colSpan={2} className="pt-2">
                    جمع جزء
                  </td>
                  <td className="pt-2">{money2(order.subtotal)}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={2}>
                      تخفیف (<bdi>{order.coupon}</bdi>)
                    </td>
                    <td>−{money2(order.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2}>مالیات</td>
                  <td>{money2(order.tax)}</td>
                </tr>
                <tr className="text-[14px] font-bold">
                  <td colSpan={2} className="pt-1">
                    مبلغ پرداختی
                  </td>
                  <td className="pt-1">{money2(order.total)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-4 text-[11px] text-ink-muted">فاکتور نمایشی؛ هیچ پولی دریافت نشده است.</p>
            <div className="no-print mt-4 flex gap-2">
              <button type="button" className="btn" onClick={() => window.print()}>
                چاپ / ذخیرهٔ PDF
              </button>
              <Link href="/library/" className="btn-ghost">
                بازگشت به دانلودها
              </Link>
            </div>
          </article>
        )}
      </div>
    </Container>
  );
}
