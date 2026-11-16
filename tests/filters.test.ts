import { describe, expect, it } from 'vitest';
import { authorName, products } from '@/lib/catalog';
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
    expect(r.length).toBe(3);
    expect(r.every((p) => p.category === 'fonts')).toBe(true);
  });

  it('filters by file type, price range and rating together', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, fileTypes: ['SVG'], maxPrice: 30, minRating: 4 });
    expect(r.length).toBeGreaterThan(0);
    for (const p of r) {
      expect(p.fileTypes).toContain('SVG');
      expect(p.salePrice ?? p.price).toBeLessThanOrEqual(30);
      expect(p.rating).toBeGreaterThanOrEqual(4);
    }
  });

  it('free only = max price 0', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, maxPrice: 0 });
    expect(r.length).toBe(4);
  });

  it('requires every selected licence', () => {
    const r = applyFilters(products, { ...DEFAULT_FILTERS, licenses: ['Extended'] });
    expect(r.every((p) => p.licenses.some((l) => l.type === 'Extended'))).toBe(true);
    expect(r.length).toBe(32);
  });

  it('searches titles, tags and author names', () => {
    expect(
      applyFilters(products, { ...DEFAULT_FILTERS, q: 'serif' }, authorName).some((p) =>
        p.slug.includes('wren'),
      ),
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
