'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { DownloadIcon, LockIcon } from '@/components/Icons';
import { LeafRow } from '@/components/LeafRating';
import ProductImage from '@/components/ProductImage';
import { downloadMime } from '@/lib/admin-products';
import { getBlob } from '@/lib/blobstore';
import { authorName, freeProducts, productHref } from '@/lib/catalog';
import { downloadDummyZip, saveBlob } from '@/lib/download';
import { licenseKey } from '@/lib/keys';
import { isEmail } from '@/lib/validation';
import type { Product } from '@/lib/types';
import { useAdminCatalog, usePublishedAdminProducts } from '@/store/admin-catalog';
import { useHydrated } from '@/store/hydration';
import { useLibrary } from '@/store/library';
import { useUI } from '@/store/ui';

export default function FreeFiles() {
  const hydrated = useHydrated();
  const unlockedEmail = useLibrary((s) => s.freeEmail);
  const unlock = useLibrary((s) => s.unlockFree);
  const counts = useLibrary((s) => s.freeDownloads);
  const countFree = useLibrary((s) => s.countFree);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const unlocked = hydrated && Boolean(unlockedEmail);
  const adminItems = usePublishedAdminProducts();
  const records = useAdminCatalog((s) => s.records);
  const toast = useUI((s) => s.toast);
  const files = useMemo(() => freeProducts(adminItems), [adminItems]);

  const download = (p: Product) => {
    const file = records.find((r) => r.product.id === p.id)?.file;
    if (file) {
      // Admin upload: the exact bytes from IndexedDB under the original file name.
      getBlob(file.key)
        .then((blob) => {
          if (!blob) throw new Error('missing');
          saveBlob(blob.type ? blob : new Blob([blob], { type: downloadMime(file.type) }), file.name);
          countFree(p.id);
        })
        .catch(() => toast('این فایل دیگر در دسترس نیست.'));
      return;
    }
    downloadDummyZip({
      slug: p.slug,
      title: p.title,
      license: 'Personal',
      licenseKey: licenseKey('FREE', p.id, unlockedEmail),
      buyer: unlockedEmail,
    });
    countFree(p.id);
  };

  return (
    <div className="space-y-[14px]">
      <section className="frame on-paper p-3 sm:p-4" aria-labelledby="gate-h">
        <h2 id="gate-h" className="flex items-center gap-1.5 font-display text-[16px] font-bold text-ink">
          {unlocked ? (
            'دانلودها باز شد'
          ) : (
            <>
              <LockIcon size={15} /> فایل‌های رایگان این ماه را باز کن
            </>
          )}
        </h2>
        {unlocked ? (
          <p className="text-[12px] text-ink" role="status">
            برای <bdi className="font-bold">{unlockedEmail}</bdi> باز شد. هر چند بار که خواستی دانلود کن.{' '}
            <button type="button" className="link" onClick={() => unlock('')}>
              استفاده از ایمیل دیگر
            </button>
          </p>
        ) : (
          <form
            noValidate
            className="mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isEmail(email)) return setError('لطفاً یک ایمیل معتبر وارد کن.');
              if (!consent) return setError('لطفاً با دریافت گاه‌به‌گاه خبرنامه موافقت کن.');
              setError('');
              unlock(email.trim().toLowerCase());
            }}
          >
            <label htmlFor="free-email" className="label">
              ایمیل تو
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="free-email"
                type="email"
                className="field max-w-[320px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'free-err' : undefined}
                placeholder="you@example.com"
                dir="ltr"
              />
              <button type="submit" className="btn">
                باز کردن دانلودها
              </button>
            </div>
            <label className="mt-2 flex items-center gap-2 text-[12px] text-ink">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              هفته‌ای یک ایمیل دوستانه برایم بفرست. هر وقت خواستم لغو اشتراک می‌کنم.
            </label>
            {error && (
              <p id="free-err" className="error-text">
                {error}
              </p>
            )}
          </form>
        )}
      </section>

      {!files.length && hydrated && (
        <div className="frame on-paper" data-testid="free-empty">
          <EmptyState title="هنوز فایل رایگانی نیست">
            فایل‌های رایگان به محض انتشار همین‌جا نمایش داده می‌شوند.
          </EmptyState>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {files.map((p) => (
          <li key={p.id} className="card frame on-paper flex flex-col p-[7px]">
            <h3 className="mb-1 px-0.5 font-serif text-[13.5px] font-bold text-[color:var(--link-strong)]">
              <Link href={productHref(p)} className="hover:underline" dir="auto">
                {p.title}
              </Link>
            </h3>
            <div className="thumb inset-img relative overflow-hidden">
              <ProductImage product={p} alt="" />
              {!unlocked && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                  <LockIcon size={26} />
                  <span className="sr-only">قفل</span>
                </span>
              )}
            </div>
            <p className="mt-1 px-0.5 text-[11px] text-ink-muted">
              از <bdi>{authorName(p.authorId)}</bdi>
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-[#c2b99f] px-0.5 pt-1.5">
              <LeafRow rating={p.rating} />
              <button
                type="button"
                className="btn !px-3 !py-1"
                disabled={!unlocked}
                onClick={() => download(p)}
              >
                <DownloadIcon size={12} /> {unlocked ? 'دانلود' : 'قفل'}
              </button>
            </div>
            {unlocked && (counts[p.id] ?? 0) > 0 && (
              <p className="px-0.5 pt-1 text-end text-[10px] text-ink-muted">{counts[p.id]} بار دانلود شده</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
