import type { Order, OrderStatus } from './types';

/** Admin-facing wording: marking an order paid is what unlocks its downloads. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'دانلود باز است',
  cancelled: 'لغوشده',
};

export const UNLOCK_LABEL = 'باز کردن دانلود';
export const LOCK_LABEL = 'قفل کردن دانلود';

/**
 * Status an unlocked order goes back to when the admin locks it again.
 * A Telegram order returns to "awaiting payment"; a hand-granted one has nothing to pay, so it is cancelled.
 */
export const lockedStatus = (o: Pick<Order, 'method'>): OrderStatus =>
  o.method === 'manual' ? 'cancelled' : 'pending';

export const isDownloadOpen = (o: Pick<Order, 'status'>): boolean => o.status === 'paid';

/**
 * True when the product's file was replaced after the order was placed, so the buyer gets a newer version
 * than the one they first bought.
 */
export function isNewVersion(fileUpdatedAt: string | undefined | null, orderCreatedAt: string): boolean {
  if (!fileUpdatedAt) return false;
  const f = Date.parse(fileUpdatedAt);
  const o = Date.parse(orderCreatedAt);
  return Number.isFinite(f) && Number.isFinite(o) && f > o;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates the admin's manual-grant form; returns Persian errors keyed by field. */
export function grantProblems(email: string, productId: string): { email?: string; product?: string } {
  const e: { email?: string; product?: string } = {};
  if (!EMAIL_RE.test(email.trim())) e.email = 'یک ایمیل معتبر وارد کن.';
  if (!productId) e.product = 'یک محصول انتخاب کن.';
  return e;
}
