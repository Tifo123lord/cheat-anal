'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import { Container } from '@/components/Layout';
import { formatDate, money2 } from '@/lib/format';
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
          <EmptyState title="Invoice not found">
            <Link href="/library/" className="link">
              Back to my downloads
            </Link>
          </EmptyState>
        ) : (
          <article aria-labelledby="inv-h">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#a49b82] pb-3">
              <div>
                <p className="font-display text-[22px] font-bold">
                  <span className="text-[#6b6754]">leaf</span>
                  <span className="text-[color:var(--link-strong)]">press</span>
                </p>
                <p className="text-[11px] text-ink-muted">
                  Cheat &amp; Anal Ltd · 1 Greenhouse Row · Demo City
                </p>
              </div>
              <div className="text-right">
                <h1 id="inv-h" className="font-display text-[18px] font-bold">
                  Invoice
                </h1>
                <p className="text-[12px]">No. {order.id}</p>
                <p className="text-[12px]">{formatDate(order.createdAt)}</p>
              </div>
            </header>
            <p className="mt-3 text-[12px]">
              Billed to <strong>{order.name}</strong> · {order.email}
            </p>
            <table className="mt-3 w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#a49b82] text-left">
                  <th scope="col" className="py-1.5">
                    Item
                  </th>
                  <th scope="col" className="py-1.5">
                    Licence
                  </th>
                  <th scope="col" className="py-1.5 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id} className="border-b border-[#c9c0a6]">
                    <td className="py-1.5 pr-2">
                      {i.title}
                      <br />
                      <span className="font-mono text-[10px] text-ink-muted">{i.licenseKey}</span>
                    </td>
                    <td className="py-1.5">{i.license}</td>
                    <td className="py-1.5 text-right">{money2(i.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-right">
                <tr>
                  <td colSpan={2} className="pt-2">
                    Subtotal
                  </td>
                  <td className="pt-2">{money2(order.subtotal)}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={2}>Discount ({order.coupon})</td>
                    <td>−{money2(order.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2}>Tax</td>
                  <td>{money2(order.tax)}</td>
                </tr>
                <tr className="text-[14px] font-bold">
                  <td colSpan={2} className="pt-1">
                    Total paid
                  </td>
                  <td className="pt-1">{money2(order.total)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-4 text-[11px] text-ink-muted">Demo invoice. No payment was taken.</p>
            <div className="no-print mt-4 flex gap-2">
              <button type="button" className="btn" onClick={() => window.print()}>
                Print / save PDF
              </button>
              <Link href="/library/" className="btn-ghost">
                Back to downloads
              </Link>
            </div>
          </article>
        )}
      </div>
    </Container>
  );
}
