import type { Product } from './types';

export type UpdateKind = 'new' | 'updated';

export interface UpdateEvent {
  kind: UpdateKind;
  product: Product;
  /** ISO time of the event. */
  date: string;
}

export interface UpdateSource {
  product: Product;
  /** When the product's downloadable file last changed (products.file_updated_at). */
  fileUpdatedAt?: string | null;
}

export const UPDATE_LABEL: Record<UpdateKind, string> = { new: 'فایل جدید', updated: 'به‌روزرسانی شد' };

/** A file stamped within this long of the product's creation is its first upload, not an update. */
const FIRST_UPLOAD_SLACK_MS = 5 * 60 * 1000;

const time = (iso: string | null | undefined): number => (iso ? Date.parse(iso) : NaN);

/**
 * Latest shop events, newest first: a product published («فایل جدید») or its file replaced («به‌روزرسانی شد»).
 * Each product appears once, with its most recent event.
 */
export function latestUpdates(sources: UpdateSource[], limit = 6): UpdateEvent[] {
  const seen = new Set<string>();
  const out: UpdateEvent[] = [];
  for (const { product, fileUpdatedAt } of sources) {
    if (seen.has(product.id)) continue;
    const created = time(product.createdAt);
    if (!Number.isFinite(created)) continue;
    seen.add(product.id);
    const f = time(fileUpdatedAt);
    out.push(
      Number.isFinite(f) && f - created > FIRST_UPLOAD_SLACK_MS
        ? { kind: 'updated', product, date: new Date(f).toISOString() }
        : { kind: 'new', product, date: new Date(created).toISOString() },
    );
  }
  return out
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.product.id.localeCompare(b.product.id))
    .slice(0, limit);
}

const DAY = 86_400_000;

/** Persian relative time («۳ ساعت پیش», «دیروز») for the last week, then the fa-IR date. */
export function relativeFa(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const diff = t - now;
  const abs = Math.abs(diff);
  if (abs >= 7 * DAY) {
    return new Date(t).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  const rtf = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });
  if (abs < 60_000) return rtf.format(0, 'second');
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / 3_600_000), 'hour');
  return rtf.format(Math.round(diff / DAY), 'day');
}
