import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TelegramOrderBox from '@/components/TelegramOrderBox';
import * as telegram from '@/lib/telegram';
import { telegramOrderText, telegramProfile, TELEGRAM_USERNAME } from '@/lib/telegram';

const order = {
  id: 'CA-1234',
  name: 'Sara',
  email: 'sara@example.com',
  total: 24,
  items: [
    {
      kind: 'product' as const,
      id: 'p1',
      title: 'UI Kit',
      license: 'Personal' as const,
      price: 24,
      licenseKey: 'k',
      downloads: 0,
    },
  ],
};

describe('telegram order link', () => {
  it('points at the plain seller chat, with no pre-filled text', () => {
    expect(TELEGRAM_USERNAME).toBe('HKARESHO');
    expect(telegramProfile()).toBe('https://t.me/HKARESHO');
    expect(telegramProfile()).not.toContain('?text=');
    expect('telegramOrderLink' in telegram).toBe(false);
  });
  it('carries order number, items, total and email', () => {
    const t = telegramOrderText(order);
    expect(t).toContain('CA-1234');
    expect(t).toContain('UI Kit');
    expect(t).toContain('$24.00');
    expect(t).toContain('سلام، می‌خوام سفارش CA-1234 رو بخرم.');
    expect(t).toContain('لایسنس شخصی');
    expect(t).toContain('مبلغ کل: $24.00');
    expect(t).toContain('sara@example.com');
  });
  it('renders a copy box with the full message and a plain Telegram chat button', () => {
    const html = renderToStaticMarkup(h(TelegramOrderBox, { order }));
    expect(html).toContain('کپی متن سفارش');
    expect(html).toContain('CA-1234');
    expect(html).toContain('readOnly'.toLowerCase());
    expect(html).toContain('href="https://t.me/HKARESHO"');
    expect(html).not.toContain('?text=');
  });
});
