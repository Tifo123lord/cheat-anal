import { describe, expect, it } from 'vitest';
import { ADMIN_AUTHOR_NAME } from '@/lib/admin-products';
import { artSvg } from '@/lib/art';
import { ADMIN_USER, DEMO_USER } from '@/lib/auth-core';
import { products } from '@/lib/catalog';
import { INFO_PAGES } from '@/lib/pages';
import { SITE } from '@/lib/site';

describe('brand', () => {
  it('is named Cheat & Anal with the short name C&A', () => {
    expect(SITE.name).toBe('Cheat & Anal');
    expect(SITE.shortName).toBe('C&A');
    expect(SITE.description.startsWith('Cheat & Anal ')).toBe(true);
    expect(ADMIN_AUTHOR_NAME).toBe('Cheat & Anal Studio');
  });

  it('no longer shows the old name in catalogue or page copy', () => {
    for (const p of products) expect(p.description).not.toMatch(/leaf ?press/i);
    expect(INFO_PAGES.find((p) => p.slug === 'about')?.title).toBe('دربارهٔ Cheat & Anal');
  });

  it('keeps the demo and admin logins unchanged so existing accounts still work', () => {
    expect(DEMO_USER.email).toBe('demo@leafpress.test');
    expect(ADMIN_USER.email).toBe('admin@leafpress.local');
  });

  it('escapes the ampersand inside generated SVG art', () => {
    const svg = artSvg('book:0', 'Cheat & Anal');
    expect(svg).not.toMatch(/&(?!amp;|lt;|gt;|quot;|#)/);
  });
});
