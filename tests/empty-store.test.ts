import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { buildProduct, defaultLicenses } from '@/lib/admin-products';
import {
  NO_FILES_TITLE,
  PLACEHOLDER_SLUG,
  allCompatibility,
  allProducts,
  allTags,
  authors,
  bundles,
  categories,
  featuredProducts,
  freeProducts,
  getProduct,
  maxPrice,
  posts,
  productSlugs,
  products,
  productsByAuthor,
  relatedProducts,
  setExtraProducts,
  topAuthors,
} from '@/lib/catalog';
import { pruneCartLines, pruneCounts, pruneIds, pruneOrders, pruneReviews } from '@/lib/prune';
import { hasSales, salesStats } from '@/lib/stats';
import type { Order } from '@/lib/types';
import sitemap from '@/app/sitemap';
import { GET as feed } from '@/app/feed.xml/route';
import ProductPage, { generateStaticParams as productParams } from '@/app/product/[slug]/page';
import BundlesPage from '@/app/bundles/page';
import AuthorsPage from '@/app/authors/page';
import AuthorPage from '@/app/authors/[id]/page';
import NewReleases from '@/app/new-releases/NewReleases';
import CategoryProducts from '@/app/category/[slug]/CategoryProducts';
import FreeFiles from '@/app/free-files/FreeFiles';
import HomeGrid from '@/components/HomeGrid';
import Sidebar from '@/components/Sidebar';

// Render as a hydrated browser would (saved data read, nothing uploaded), so empty panels replace skeletons.
vi.mock('@/store/hydration', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/hydration')>()),
  useHydrated: () => true,
}));

const adminFile = (id: string, price = 5) =>
  buildProduct(
    {
      title: 'Hookshot Loader',
      description: 'A loader DLL with a config and a short read-me file.',
      category: 'cheats',
      price,
      salePrice: null,
      tags: ['dll', 'mod'],
      fileTypes: ['dll'],
      licenses: defaultLicenses(price),
    },
    { id, now: '2026-11-17', images: [], categoryArt: 'code', fileSize: 2048 },
  );

const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe('the seed is empty', () => {
  it('ships no products and no bundles', () => {
    expect(products).toEqual([]);
    expect(bundles).toEqual([]);
    expect(allProducts()).toEqual([]);
  });

  it('scripts/seed.mjs generates zero products and zero bundles', () => {
    const dir = mkdtempSync(join(tmpdir(), 'seed-'));
    mkdirSync(join(dir, 'scripts'));
    mkdirSync(join(dir, 'data'));
    copyFileSync(new URL('../scripts/seed.mjs', import.meta.url), join(dir, 'scripts', 'seed.mjs'));
    const out = execFileSync(process.execPath, [join(dir, 'scripts', 'seed.mjs')], { encoding: 'utf8' });
    expect(out).toContain('wrote 0 products, 0 bundles');
    const read = (f: string) => JSON.parse(readFileSync(join(dir, 'data', f), 'utf8'));
    expect(read('products.json')).toEqual([]);
    expect(read('bundles.json')).toEqual([]);
    // The committed data matches what the script writes.
    for (const f of ['categories.json', 'authors.json', 'posts.json', 'products.json', 'bundles.json'])
      expect(read(f)).toEqual(JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8')));
  });

  it('keeps the 13 categories (Cheats included), the authors and the journal', () => {
    expect(categories).toHaveLength(13);
    expect(categories.some((c) => c.id === 'cheats')).toBe(true);
    expect(authors.length).toBeGreaterThan(0);
    expect(posts.length).toBeGreaterThan(0);
  });

  it('leaves no stats behind for removed files', () => {
    for (const a of authors) {
      expect(a.sales).toBe(0);
      expect(a.rating).toBe(0);
    }
    expect(topAuthors()).toHaveLength(authors.length);
    expect(hasSales(salesStats())).toBe(false);
  });

  it('lists are empty and helpers stay finite', () => {
    expect(featuredProducts()).toEqual([]);
    expect(freeProducts()).toEqual([]);
    expect(allTags()).toEqual([]);
    expect(allCompatibility()).toEqual([]);
    expect(maxPrice()).toBe(100);
    expect(productsByAuthor(authors[0].id)).toEqual([]);
  });

  it('pre-renders only the placeholder product page, and no sitemap/feed entry points at a product', async () => {
    expect(productSlugs()).toEqual([PLACEHOLDER_SLUG]);
    expect(productParams()).toEqual([{ slug: PLACEHOLDER_SLUG }]);
    expect(sitemap().some((e) => e.url.includes('/product/'))).toBe(false);
    expect(await feed().text()).not.toContain('<item>');
  });

  it('bundles never reference a missing product', () => {
    for (const b of bundles) for (const id of b.productIds) expect(getProduct(id)).toBeDefined();
  });
});

describe('admin uploads still show up', () => {
  it('join listings, free files, related items and the price filter', () => {
    const paid = adminFile('adm-paid', 7);
    const free = adminFile('adm-free', 0);
    setExtraProducts([paid, free], [paid, free]);
    expect(allProducts().map((p) => p.id)).toEqual(['adm-paid', 'adm-free']);
    expect(freeProducts([paid, free]).map((p) => p.id)).toEqual(['adm-free']);
    expect(relatedProducts(paid).map((p) => p.id)).toEqual(['adm-free']);
    expect(maxPrice()).toBe(7);
    setExtraProducts([], []);
  });
});

describe('saved data from the old demo is pruned', () => {
  const noBundle = () => false;
  it('drops removed seed files and bundles but keeps admin uploads', () => {
    expect(
      pruneCartLines(
        [
          { kind: 'product', id: 'p01', license: 'Personal' },
          { kind: 'bundle', id: 'starter-garden', license: 'Personal' },
          { kind: 'product', id: 'adm-x', license: 'Personal' },
        ],
        noBundle,
      ).map((l) => l.id),
    ).toEqual(['adm-x']);
    expect(pruneIds(['p36', 'adm-x', 'p07'])).toEqual(['adm-x']);
    expect(pruneCounts({ p14: 2, 'adm-y': 1 })).toEqual({ 'adm-y': 1 });
    expect(
      pruneReviews([
        { id: 'r1', productId: 'p02', name: 'A', rating: 5, text: 'ok', date: '2026-01-01' },
        { id: 'r2', productId: 'adm-x', name: 'B', rating: 4, text: 'ok', date: '2026-01-01' },
      ]).map((r) => r.id),
    ).toEqual(['r2']);
  });

  it('removes retired items from orders and drops orders left empty', () => {
    const order = (id: string, itemIds: string[]): Order => ({
      id,
      items: itemIds.map((i) => ({
        kind: 'product' as const,
        id: i,
        title: i,
        license: 'Personal' as const,
        price: 1,
        licenseKey: 'K',
        downloads: 0,
      })),
      subtotal: 1,
      discount: 0,
      tax: 0,
      total: 1,
      email: 'demo@leafpress.test',
      name: 'Demo',
      createdAt: '2026-11-01',
      licenseKeys: [],
    });
    const out = pruneOrders([order('o1', ['p01', 'p02']), order('o2', ['p03', 'adm-x'])], noBundle);
    expect(out.map((o) => [o.id, o.items.map((i) => i.id)])).toEqual([['o2', ['adm-x']]]);
  });
});

describe('empty states render', () => {
  it('home grid shows a "No files yet" panel', () => {
    const html = render(h(HomeGrid, { items: [] }));
    expect(html).toContain('data-testid="home-empty"');
    expect(html).toContain(NO_FILES_TITLE);
  });

  it('new releases, category pages and free files show their empty panels', () => {
    expect(render(h(NewReleases))).toContain('data-testid="new-releases-empty"');
    const cat = render(
      h(CategoryProducts, {
        categoryId: 'cheats',
        emptyTitle: 'هنوز در «چیت‌ها» فایلی نیست — به‌زودی دوباره سر بزن',
      }),
    );
    expect(cat).toContain('data-testid="category-empty"');
    expect(cat).toContain('هنوز در «چیت‌ها» فایلی نیست');
    expect(render(h(FreeFiles))).toContain('data-testid="free-empty"');
  });

  it('bundles and author pages show empty panels without stats', () => {
    expect(render(h(BundlesPage))).toContain('هنوز بسته‌ای نیست');
    const author = render(h(AuthorPage, { params: { id: authors[0].id } }));
    expect(author).toContain('data-testid="author-empty"');
    const list = render(h(AuthorsPage));
    expect(list).not.toMatch(/Top authors|\d+ sales|\d+ فروش/);
    expect(list).toContain('0 فایل');
  });

  it('the sidebar has no sales counts or ads, lists game tags and the latest updates', () => {
    const html = render(h(Sidebar));
    expect(html).not.toMatch(/\d+ فروش/);
    expect(html).not.toMatch(/Packly|Birdsong|NavKit|تبلیغ/);
    expect(html).toContain('سازنده‌ها');
    expect(html).toContain('sb-tags');
    expect(html).toMatch(/href="\/shop\/?\?game=cs2"/);
    expect(html).toContain('>FiveM<');
    expect(html).toContain('آخرین به‌روزرسانی‌ها');
    expect(html).toContain('data-testid="updates-empty"');
    expect(render(h(Sidebar, { updates: false }))).not.toContain('آخرین به‌روزرسانی‌ها');
  });

  it('the placeholder product page renders "File not found"; old seeded slugs are gone', () => {
    expect(render(h(ProductPage, { params: { slug: PLACEHOLDER_SLUG } }))).toContain('فایل پیدا نشد');
    expect(() => render(h(ProductPage, { params: { slug: 'canopy-agency-landing-template' } }))).toThrow();
  });
});
