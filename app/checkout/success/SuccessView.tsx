'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import { CheckIcon, DownloadIcon } from '@/components/Icons';
import { Container } from '@/components/Layout';
import { slugFor } from '@/lib/cart-view';
import { downloadDummyZip } from '@/lib/download';
import { money2 } from '@/lib/format';
import { licenseLabel } from '@/lib/i18n';
import { useHydrated } from '@/store/hydration';
import { useLibrary } from '@/store/library';
import TelegramOrderBox from '@/components/TelegramOrderBox';

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
          <EmptyState title="این سفارش پیدا نشد">
            شاید در مرورگر دیگری ثبت شده باشد. خریدهایت در{' '}
            <Link href="/library/" className="link">
              دانلودهای من
            </Link>{' '}
            هستند.
          </EmptyState>
        ) : order.status !== 'paid' ? (
          <div data-testid="order-pending">
            <h1 className="page-title">سفارش ثبت شد؛ فقط یک قدم مانده</h1>
            <p className="text-[13px] text-ink">
              شمارهٔ سفارش{' '}
              <bdi className="font-bold" data-testid="order-number">
                {order.id}
              </bdi>{' '}
              · {money2(order.total)}
            </p>
            <p className="mt-2 text-[13px] text-ink">
              {order.status === 'cancelled'
                ? 'این سفارش لغو شده است.'
                : 'برای پرداخت، متن سفارش را کپی کن و در تلگرام بفرست. به محض تأیید پرداخت، فایل‌هایت در «دانلودهای من» باز می‌شوند.'}
            </p>
            <ul className="mt-3 text-[12px] text-ink">
              {order.items.map((i) => (
                <li key={i.id}>
                  <bdi>{i.title}</bdi> <span className="text-ink-muted">({licenseLabel(i.license)})</span> ·{' '}
                  {money2(i.price)}
                </li>
              ))}
            </ul>
            {order.status !== 'cancelled' && (
              <div className="mt-4">
                <TelegramOrderBox order={order} />
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/library/" className="btn-olive">
                رفتن به دانلودهای من
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-leaf p-2 text-white">
                <CheckIcon size={22} />
              </span>
              <div>
                <h1 className="page-title">
                  ممنون، <bdi>{order.name.split(' ')[0]}</bdi>!
                </h1>
                <p className="text-[13px] text-ink">
                  شمارهٔ سفارش{' '}
                  <bdi className="font-bold" data-testid="order-number">
                    {order.id}
                  </bdi>{' '}
                  · {money2(order.total)} · رسید به <bdi>{order.email}</bdi> فرستاده شد
                </p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-[#bcb399] rounded-md border border-[#bcb399]">
              {order.items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-ink" dir="auto">
                      {i.title}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      لایسنس {licenseLabel(i.license)} · کلید{' '}
                      <code className="font-mono text-ink" dir="ltr">
                        {i.licenseKey}
                      </code>
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
                    <DownloadIcon size={13} /> دانلود
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/library/" className="btn-olive">
                رفتن به دانلودهای من
              </Link>
              <Link href={`/library/invoice/?order=${encodeURIComponent(order.id)}`} className="btn-ghost">
                مشاهدهٔ فاکتور
              </Link>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
