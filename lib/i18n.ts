import type { Badge, LicenseType } from './types';

/** Persian labels for licence types. The stored values ('Personal', …) stay English data keys. */
export const LICENSE_LABELS: Record<LicenseType, string> = {
  Personal: 'شخصی',
  Commercial: 'تجاری',
  Extended: 'گسترده',
};

export const licenseLabel = (l: string): string => LICENSE_LABELS[l as LicenseType] ?? l;

/** Persian labels for product badges (the stored values stay English). */
export const BADGE_LABELS: Record<Badge, string> = {
  NEW: 'جدید',
  BESTSELLER: 'پرفروش',
  SALE: 'تخفیف',
  FREE: 'رایگان',
};

export const badgeLabel = (b: string): string => BADGE_LABELS[b as Badge] ?? b;

/** Persian label for an order's payment status. */
export const ORDER_STATUS_LABELS: Record<'pending' | 'paid' | 'cancelled', string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت‌شده',
  cancelled: 'لغوشده',
};
