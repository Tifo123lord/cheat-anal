'use client';

import Link from 'next/link';
import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { CheckIcon, DownloadIcon } from '@/components/Icons';
import { Container } from '@/components/Layout';
import ProductImage from '@/components/ProductImage';
import { slugFor } from '@/lib/cart-view';
import { getBundle, getProduct } from '@/lib/catalog';
import { downloadMime } from '@/lib/admin-products';
import { getBlob } from '@/lib/blobstore';
import { downloadDummyZip, saveBlob } from '@/lib/download';
import { formatDate, money2 } from '@/lib/format';
import { useHydrated } from '@/store/hydration';
import { useAdminCatalog } from '@/store/admin-catalog';
import { useLibrary } from '@/store/library';
import { useUI } from '@/store/ui';
import { useRequireLogin } from '@/components/useRequireLogin';
import TelegramIcon from '@/components/TelegramIcon';
import { telegramOrderLink } from '@/lib/telegram';

const imagesFor = (kind: 'product' | 'bundle', id: string): string[] =>
  kind === 'product'
    ? (getProduct(id)?.images ?? ['gradient:0'])
    : (getProduct(getBundle(id)?.productIds[0] ?? '')?.images ?? ['gradient:3']);

export default function LibraryView() {
  const hydrated = useHydrated();
  const { user } = useRequireLogin();
  const allOrders = useLibrary((s) => s.orders);
  const orders = user ? allOrders.filter((o) => (o.ownerEmail ?? o.email).toLowerCase() === user.email) : [];
  const records = useAdminCatalog((s) => s.records);
  const toast = useUI((s) => s.toast);
  const count = useLibrary((s) => s.countDownload);
  const [preparing, setPreparing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const download = (orderId: string, buyer: string, item: (typeof orders)[number]['items'][number]) => {
    const key = `${orderId}-${item.id}`;
    setPreparing(key);
    const rec = item.kind === 'product' ? records.find((r) => r.product.id === item.id) : undefined;
    if (rec?.file) {
      // Admin-uploaded file: hand back the exact bytes from IndexedDB under the original file name.
      const file = rec.file;
      getBlob(file.key)
        .then((blob) => {
          if (!blob) throw new Error('missing');
          // Same bytes, original name; a generic binary type when the browser had no MIME for it.
          const out = blob.type ? blob : new Blob([blob], { type: downloadMime(file.type) });
          saveBlob(out, file.name);
          count(orderId, item.id);
        })
        .catch(() => toast('This file is not stored in this browser any more.'))
        .finally(() => setPreparing(null));
      return;
    }
    // Simulates a signed, expiring download link being generated server-side.
    window.setTimeout(() => {
      downloadDummyZip({
        slug: slugFor(item.kind, item.id),
        title: item.title,
        license: item.license,
        licenseKey: item.licenseKey,
        buyer,
      });
      count(orderId, item.id);
      setPreparing(null);
    }, 600);
  };

  const copy = async (k: string) => {
    try {
      await navigator.clipboard.writeText(k);
      setCopied(k);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <Container className="mt-3 md:mt-[14px]">
      <section className="frame on-paper p-3 sm:p-5" aria-labelledby="lib-h">
        <h1 id="lib-h" className="page-title">
          My downloads
        </h1>
        <p className="text-[12px] text-ink-muted">
          Every file you buy lives here with its licence key. Re-download as often as you like.
        </p>
        {!hydrated || !user ? (
          <div className="mt-4 space-y-3" aria-busy="true">
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title="No downloads yet">
            When you buy a file it appears here.{' '}
            <Link href="/shop/" className="link">
              Start browsing
            </Link>{' '}
            or pick up a{' '}
            <Link href="/free-files/" className="link">
              free file
            </Link>
            .
          </EmptyState>
        ) : (
          <ol className="mt-4 space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-md border border-[#a49b82] bg-paper-light/50">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#bcb399] px-3 py-2 text-[12px] text-ink">
                  <span>
                    Order <strong>{o.id}</strong> · {formatDate(o.createdAt)} · {money2(o.total)} ·{' '}
                    <strong data-testid="order-status">
                      {o.status === 'paid'
                        ? 'Paid'
                        : o.status === 'cancelled'
                          ? 'Cancelled'
                          : 'Awaiting payment'}
                    </strong>
                  </span>
                  <Link href={`/library/invoice/?order=${encodeURIComponent(o.id)}`} className="link">
                    View invoice
                  </Link>
                </div>
                <ul className="divide-y divide-[#c9c0a6]">
                  {o.items.map((i) => {
                    const key = `${o.id}-${i.id}`;
                    return (
                      <li key={i.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                        <span className="inset-img block w-[84px] shrink-0 overflow-hidden">
                          <ProductImage
                            product={{ images: imagesFor(i.kind, i.id), title: i.title }}
                            alt=""
                            sizes="84px"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-ink">{i.title}</p>
                          <p className="text-[11px] text-ink-muted">{i.license} licence</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink">
                            <span className="sr-only">Licence key</span>
                            <code className="rounded bg-[#efe9da] px-1.5 py-0.5 font-mono">
                              {i.licenseKey}
                            </code>
                            <button
                              type="button"
                              className="link !text-[11px]"
                              onClick={() => copy(i.licenseKey)}
                            >
                              {copied === i.licenseKey ? (
                                <span className="inline-flex items-center gap-0.5">
                                  <CheckIcon size={10} /> Copied
                                </span>
                              ) : (
                                'Copy'
                              )}
                            </button>
                          </p>
                        </div>
                        {o.status !== 'paid' ? (
                          <div className="text-right text-[11px] text-ink-muted">
                            {o.status === 'cancelled' ? (
                              'Cancelled'
                            ) : (
                              <>
                                <a
                                  href={telegramOrderLink(o)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn"
                                >
                                  <TelegramIcon size={13} /> Pay on Telegram
                                </a>
                                <p className="mt-1">Download opens after payment</p>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <button
                              type="button"
                              className="btn"
                              onClick={() => download(o.id, o.name, i)}
                              disabled={preparing === key}
                              aria-live="polite"
                            >
                              <DownloadIcon size={13} />{' '}
                              {preparing === key ? 'Preparing…' : i.downloads ? 'Download again' : 'Download'}
                            </button>
                            <p className="mt-1 text-[11px] text-ink-muted">
                              Downloaded {i.downloads} {i.downloads === 1 ? 'time' : 'times'}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Container>
  );
}
