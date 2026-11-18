import { licenseLabel } from './i18n';
import type { Order } from './types';

/** Telegram account buyers message to pay (without the @). */
export const TELEGRAM_USERNAME = (process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? 'HKARESHO').replace(/^@/, '');

/** Plain chat with the seller (no pre-filled text: buyers copy the order message and paste it themselves). */
export const telegramProfile = (): string => `https://t.me/${TELEGRAM_USERNAME}`;

/** The message a buyer sends to pay for an order. */
export function telegramOrderText(o: Pick<Order, 'id' | 'items' | 'total' | 'email' | 'name'>): string {
  const lines = o.items.map(
    (i) => `• ${i.title} (لایسنس ${licenseLabel(i.license)}) — $${i.price.toFixed(2)}`,
  );
  return [
    `سلام، می‌خوام سفارش ${o.id} رو بخرم.`,
    ...lines,
    `مبلغ کل: $${o.total.toFixed(2)}`,
    `ایمیل حساب: ${o.email}`,
    `نام: ${o.name}`,
  ].join('\n');
}
