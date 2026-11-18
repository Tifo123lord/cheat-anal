import type { Order } from './types';

/** Telegram account buyers message to pay (without the @). */
export const TELEGRAM_USERNAME = (process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? 'HKARESHO').replace(/^@/, '');

export const telegramProfile = (): string => `https://t.me/${TELEGRAM_USERNAME}`;

/** The message a buyer sends to pay for an order. */
export function telegramOrderText(o: Pick<Order, 'id' | 'items' | 'total' | 'email' | 'name'>): string {
  const lines = o.items.map((i) => `• ${i.title} (${i.license}) — $${i.price.toFixed(2)}`);
  return [
    `Hi! I want to buy order ${o.id}`,
    ...lines,
    `Total: $${o.total.toFixed(2)}`,
    `Account email: ${o.email}`,
    `Name: ${o.name}`,
  ].join('\n');
}

/** Opens a chat with the seller, with the order message ready to send. */
export const telegramOrderLink = (o: Pick<Order, 'id' | 'items' | 'total' | 'email' | 'name'>): string =>
  `${telegramProfile()}?text=${encodeURIComponent(telegramOrderText(o))}`;
