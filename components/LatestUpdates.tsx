'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { productHref, products as seeded } from '@/lib/catalog';
import { formatDate } from '@/lib/format';
import { latestUpdates, relativeFa, UPDATE_LABEL, type UpdateSource } from '@/lib/updates';
import { useAdminCatalog } from '@/store/admin-catalog';

const BADGE = {
  new: 'bg-[#2f6d68] text-white border-[#1b4441]',
  updated: 'bg-[#e0b040] text-[#2b2a22] border-[#9b7a22]',
} as const;

/**
 * «آخرین به‌روزرسانی‌ها»: newly published files and files whose download was replaced, newest first.
 * Reads the live catalogue (Supabase products: created_at / file_updated_at); when it has not loaded
 * (offline, or before hydration) it falls back to the local catalogue data.
 */
export default function LatestUpdates({ compact = false, limit = 6 }: { compact?: boolean; limit?: number }) {
  const records = useAdminCatalog((s) => s.records);
  const loaded = useAdminCatalog((s) => s.loaded);
  // Relative times depend on the clock; render absolute dates until mounted to keep hydration stable.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const events = useMemo(() => {
    const live: UpdateSource[] = records
      .filter((r) => r.published)
      .map((r) => ({ product: r.product, fileUpdatedAt: r.file?.updatedAt }));
    const local: UpdateSource[] = seeded.map((p) => ({ product: p, fileUpdatedAt: p.updatedAt }));
    return latestUpdates(loaded || live.length ? [...live, ...local] : local, limit);
  }, [records, loaded, limit]);

  if (!events.length) {
    return (
      <p className="text-[12px] text-ink-muted" data-testid="updates-empty">
        هنوز به‌روزرسانی‌ای نیست؛ فایل‌های جدید و نسخه‌های تازه همین‌جا اعلام می‌شوند.
      </p>
    );
  }

  return (
    <ol
      className={compact ? 'space-y-2' : 'grid grid-cols-1 gap-2 sm:grid-cols-2'}
      data-testid="latest-updates"
    >
      {events.map((e) => (
        <li key={e.product.id}>
          <Link
            href={productHref(e.product)}
            className={`flex items-start gap-2 hover:underline ${compact ? '' : 'rounded-md border border-[#a49b82] bg-paper-light/50 p-2.5'}`}
          >
            <span
              className={`mt-0.5 shrink-0 rounded-sm border px-1.5 py-[1px] text-[9px] font-extrabold ${BADGE[e.kind]}`}
              data-kind={e.kind}
            >
              {UPDATE_LABEL[e.kind]}
            </span>
            <span className="min-w-0 flex-1">
              <bdi
                className={`block truncate font-semibold text-ink ${compact ? 'text-[12px]' : 'text-[13px]'}`}
              >
                {e.product.title}
              </bdi>
              <time dateTime={e.date} title={formatDate(e.date)} className="block text-[11px] text-ink-muted">
                {now === null ? formatDate(e.date) : relativeFa(e.date, now)}
              </time>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
