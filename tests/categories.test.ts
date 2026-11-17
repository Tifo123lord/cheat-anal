import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildProduct, defaultLicenses } from '@/lib/admin-products';
import { categories, categoryEmptyText, getCategory, products, productsInCategory } from '@/lib/catalog';
import { DEFAULT_FILTERS, applyFilters, filtersToQuery, parseFilters } from '@/lib/filters';
import { NAV_ITEMS } from '@/components/nav-items';
import sitemap from '@/app/sitemap';
import { generateStaticParams } from '@/app/category/[slug]/page';

// The icon module is TSX; read the glyph names from its source to keep this test in the node environment.
const iconSource = readFileSync(new URL('../components/Icons.tsx', import.meta.url), 'utf8');

const cheatsProduct = () =>
  buildProduct(
    {
      title: 'Aimtrainer Config Pack',
      description: 'Crosshair configs and a Lua helper script for practice servers.',
      category: 'cheats',
      price: 5,
      salePrice: null,
      tags: ['cfg', 'lua'],
      fileTypes: ['dll'],
      licenses: defaultLicenses(5),
    },
    { id: 'adm-cheat1', now: '2026-11-17', images: [], categoryArt: 'code', fileSize: 1024 },
  );

describe('categories', () => {
  it('has 13 categories with unique ids', () => {
    expect(categories).toHaveLength(13);
    expect(new Set(categories.map((c) => c.id)).size).toBe(13);
  });

  it('includes Cheats with its description and a crosshair glyph', () => {
    const c = getCategory('cheats');
    expect(c).toMatchObject({
      id: 'cheats',
      name: 'Cheats',
      description: 'Configs, scripts and mods: dll, lua, cfg and more',
      icon: 'crosshair',
    });
    expect(iconSource).toMatch(/\n\s+crosshair: '/);
  });

  it('gives every category an icon that exists', () => {
    for (const c of categories) expect(iconSource, c.icon).toMatch(new RegExp(`\\n\\s+'?${c.icon}'?: '`));
  });

  it('ships no seeded cheats', () => {
    expect(products.filter((p) => p.category === 'cheats')).toHaveLength(0);
    expect(productsInCategory(products, 'cheats')).toEqual([]);
    expect(categoryEmptyText(getCategory('cheats')!)).toBe('No cheats yet — check back soon');
  });

  it('every seeded product belongs to a known category', () => {
    const ids = new Set(categories.map((c) => c.id));
    expect(products.every((p) => ids.has(p.category))).toBe(true);
  });

  it('lists admin products in Cheats on the category page and in the shop filter', () => {
    const extra = cheatsProduct();
    const all = [extra, ...products];
    expect(productsInCategory(all, 'cheats').map((p) => p.id)).toEqual(['adm-cheat1']);
    const f = parseFilters(new URLSearchParams('category=cheats'));
    expect(f.categories).toEqual(['cheats']);
    expect(applyFilters(all, f).map((p) => p.id)).toEqual(['adm-cheat1']);
    expect(filtersToQuery({ ...DEFAULT_FILTERS, categories: ['cheats'] })).toBe('category=cheats');
  });

  it('generates a static page for every category, cheats included', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(13);
    expect(params).toContainEqual({ slug: 'cheats' });
  });

  it('puts Cheats in the main nav right after Shop', () => {
    const i = NAV_ITEMS.findIndex((n) => n.href === '/shop/');
    expect(NAV_ITEMS[i + 1]).toEqual({ href: '/category/cheats/', label: 'Cheats' });
  });

  it('lists every category page in the sitemap', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.filter((u) => /\/category\/[^/]+\/$/.test(u))).toHaveLength(13);
    expect(urls.some((u) => u.endsWith('/category/cheats/'))).toBe(true);
  });
});
