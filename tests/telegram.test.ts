import { describe, expect, it } from 'vitest';
import { telegramOrderLink, telegramOrderText, TELEGRAM_USERNAME } from '@/lib/telegram';

const order = {
  id: 'CA-1234',
  name: 'Sara',
  email: 'sara@example.com',
  total: 24,
  items: [
    { kind: 'product' as const, id: 'p1', title: 'UI Kit', license: 'Personal' as const, price: 24, licenseKey: 'k', downloads: 0 },
  ],
};

describe('telegram order link', () => {
  it('points at the seller account', () => {
    expect(TELEGRAM_USERNAME).toBe('HKARESHO');
    expect(telegramOrderLink(order).startsWith('https://t.me/HKARESHO?text=')).toBe(true);
  });
  it('carries order number, items, total and email', () => {
    const t = telegramOrderText(order);
    expect(t).toContain('CA-1234');
    expect(t).toContain('UI Kit');
    expect(t).toContain('$24.00');
    expect(t).toContain('sara@example.com');
    expect(decodeURIComponent(telegramOrderLink(order).split('?text=')[1])).toBe(t);
  });
});
