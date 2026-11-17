import { describe, expect, it } from 'vitest';
import { authorName } from '@/lib/catalog';
import type { Product } from '@/lib/types';
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  applyFilters,
  filtersToQuery,
  paginate,
  parseFilters,
  sortProducts,
} from '@/lib/filters';

const q = (s: string) => new URLSearchParams(s);

// The store ships with no seeded files, so filtering and sorting run on a small fixture catalogue.
const make = (id: string, patch: Partial<Product>): Product => ({
  id,
  slug: id,
  title: `File ${id}`,
  description: 'A test file.',
  price: 10,
  category: 'templates',
  tags: [],
  fileTypes: ['ZIP'],
  fileSize: '1 MB',
  version: '1.0.0',
  compatibility: [],
  licenses: [
    { type: 'Personal', price: patch.price ?? 10 },
    { type: 'Commercial', price: (patch.price ?? 10) * 2 },
  ],
  images: ['gradient:1'],
  authorId: 'leafpress-studio',
  rating: 0,
  votes: 0,
  sales: 0,
  badges: [],
  createdAt: '2026-11-01',
  updatedAt: '2026-11-01',
  ...patch,
});
const products: Product[] = [
  make('a1', {
    category: 'fonts',
    title: 'Wren Serif',
    tags: ['serif'],
    fileTypes: ['OTF'],
    price: 19,
    rating: 4.5,
    sales: 40,
    createdAt: '2026-11-10',
  }),
  make('a2', {
    category: 'fonts',
    title: 'Bramble Sans',
    fileTypes: ['OTF', 'SVG'],
    price: 24,
    salePrice: 17,
    rating: 3.2,
    sales: 5,
    createdAt: '2026-10-01',
  }),
  make('a3', {
    category: 'icons',
    title: 'Line Icons',
    fileTypes: ['SVG'],
    price: 29,
    rating: 4.8,
    sales: 90,
    createdAt: '2026-09-01',
    authorId: 'mossy-pixel',
  }),
  make('a4', {
    category: 'cheats',
    title: 'Hookshot Loader',
    fileTypes: ['DLL'],
    price: 0,
    licenses: [{ type: 'Personal', price: 0 }],
    createdAt: '2026-11-12',
  }),
  make('a5', {
    category: 'icons',
    title: 'Duotone Set',
    fileTypes: ['SVG'],
    price: 49,
    rating: 3.9,
    sales: 12,
    createdAt: '2026-08-15',
    licenses: [
      { type: 'Personal', price: 49 },
      { type: 'Extended', price: 490 },
    ],
  }),
];

describe('parse / serialise filters', () => {
  it('round-trips through the URL', () => {
    const f = parseFilters(
      q(
        'q=icons&category=icons,fonts&type=svg&compat=Figma&license=Extended&min=5&max=40&rating=4&sort=price-asc&page=2',
      ),
    );
    expect(f).toMatchObject({
      q: 'icons',
      categories: ['icons', 'fonts'],
      fileTypes: ['SVG'],
      compatibility: ['Figma'],
      licenses: ['Extended'],
      minPrice: 5,
      maxPrice: 40,
      minRating: 4,
      sort: 'price-asc',
      page: 2,
    });
    expect(parseFilters(q(filtersToQuery(f)))).toEqual(f);
  });

  it('drops invalid values and defaults', () => {
    const f = parseFilters(q('sort=bogus&page=-3&rating=99&min=abc&license=Gold'));
    expect(f.sort).toBe('newest');
    expect(f.page).toBe(1);
    expect(f.minRating).toBe(5);
    expect(f.minPrice).toBeNull();
    expect(f.licenses).toEqual([]);
    expect(filtersToQuery(DEFAULT_FILTERS)).toBe('');
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
  });
});

describe('applyFilters', () => {
  it('filters by category', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, categories: ['fonts'] });
    expect(r.map((p) => p.id)).toEqual(['a1', 'a2']);
    expect(r.every((p) => p.category === 'fonts')).toBe(true);
  });

  it('filters by file type, price range and rating together', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, fileTypes: ['SVG'], maxPrice: 30, minRating: 4 });
    expect(r.map((p) => p.id)).toEqual(['a3']);
    for (const p of r) {
      expect(p.fileTypes).toContain('SVG');
      expect(p.salePrice ?? p.price).toBeLessThanOrEqual(30);
      expect(p.rating).toBeGreaterThanOrEqual(4);
    }
  });

  it('free only = max price 0', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, maxPrice: 0 });
    expect(r.map((p) => p.id)).toEqual(['a4']);
  });

  it('requires every selected licence', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, licenses: ['Extended'] });
    expect(r.every((p) => p.licenses.some((l) => l.type === 'Extended'))).toBe(true);
    expect(r.map((p) => p.id)).toEqual(['a5']);
  });

  it('searches titles, tags and author names', () => {
    expect(
      applyFilters(products, { ...DEFAULT_FILTERS, q: 'serif' }, authorName).some((p) => p.id === 'a1'),
    ).toBe(true);
    expect(
      applyFilters(products, { ...DEFAULT_FILTERS, q: 'mossy pixel' }, authorName).length,
    ).toBeGreaterThan(0);
    expect(applyFilters(products, { ...DEFAULT_FILTERS, q: 'zzzz' }, authorName)).toEqual([]);
  });
});

describe('sortProducts', () => {
  const price = (p: (typeof products)[number]) => p.salePrice ?? p.price;
  it('sorts by price both ways', () => {
    const asc = sortProducts(products, 'price-asc');
    for (let i = 1; i < asc.length; i += 1) expect(price(asc[i])).toBeGreaterThanOrEqual(price(asc[i - 1]));
    const desc = sortProducts(products, 'price-desc');
    expect(price(desc[0])).toBe(Math.max(...products.map(price)));
  });
  it('sorts by newest, popular and rating', () => {
    const n = sortProducts(products, 'newest');
    expect(n[0].createdAt >= n[n.length - 1].createdAt).toBe(true);
    expect(sortProducts(products, 'popular')[0].sales).toBe(Math.max(...products.map((p) => p.sales)));
    expect(sortProducts(products, 'rating')[0].rating).toBe(Math.max(...products.map((p) => p.rating)));
  });
  it('does not mutate the input', () => {
    const copy = [...products];
    sortProducts(products, 'price-asc');
    expect(products).toEqual(copy);
  });
});

describe('paginate', () => {
  it('slices and clamps', () => {
    const items = Array.from({ length: 30 }, (_, i) => i);
    expect(paginate(items, 1, 12)).toMatchObject({ pages: 3, page: 1 });
    expect(paginate(items, 3, 12).items).toEqual([24, 25, 26, 27, 28, 29]);
    expect(paginate(items, 9, 12).page).toBe(3);
    expect(paginate([], 1, 12)).toMatchObject({ pages: 1, items: [] });
  });
});
