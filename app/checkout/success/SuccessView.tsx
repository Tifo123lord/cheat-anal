'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import { CheckIcon, DownloadIcon } from '@/components/Icons';
import { Container } from '@/components/Layout';
import { slugFor } from '@/lib/cart-view';
import { downloadDummyZip } from '@/lib/download';
import { money2 } from '@/lib/format';
import { useHydrated } from '@/store/hydration';
import { useLibrary } from '@/store/library';

export default function SuccessView() {
  const params = useSearchParams();
  const id = params.get('order') ?? '';
  const hydrated = useHydrated();
  const order = useLibrary((s) => s.orders.find((o) => o.id === id));
  const count = useLibrary((s) => s.countDownload);

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="frame on-paper mx-auto max-w-[720px] p-4 sm:p-6">
        {!hydrated ? (
          <div className="skeleton h-40 w-full" aria-busy="true" />
        ) : !order ? (
          <EmptyState title="We couldn't find that order">
            It may have been placed in another browser. Your purchases live in{' '}
            <Link href="/library/" className="link">
              My downloads
            </Link>
            .
          </EmptyState>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-leaf p-2 text-white">
                <CheckIcon size={22} />
              </span>
              <div>
                <h1 className="page-title">Thank you, {order.name.split(' ')[0]}!</h1>
                <p className="text-[13px] text-ink">
                  Order number <strong data-testid="order-number">{order.id}</strong> · {money2(order.total)}{' '}
                  · receipt sent to {order.email}
                </p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-[#bcb399] rounded-md border border-[#bcb399]">
              {order.items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-ink">{i.title}</p>
                    <p className="text-[11px] text-ink-muted">
                      {i.license} licence · key <code className="font-mono text-ink">{i.licenseKey}</code>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      downloadDummyZip({
                        slug: slugFor(i.kind, i.id),
                        title: i.title,
                        license: i.license,
                        licenseKey: i.licenseKey,
                        buyer: order.name,
                      });
                      count(order.id, i.id);
                    }}
                  >
                    <DownloadIcon size={13} /> Download
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/library/" className="btn-olive">
                Go to my downloads
              </Link>
              <Link href={`/library/invoice/?order=${encodeURIComponent(order.id)}`} className="btn-ghost">
                View invoice
              </Link>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
