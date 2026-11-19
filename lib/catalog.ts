import productsJson from '@/data/products.json';
import authorsJson from '@/data/authors.json';
import categoriesJson from '@/data/categories.json';
import bundlesJson from '@/data/bundles.json';
import postsJson from '@/data/posts.json';
import { fileTypeOptions } from './file-types';
import { GAMES, gameFor, gameHref, productGames } from './games';
import type { Author, Bundle, Category, Post, Product } from './types';

export const products = productsJson as Product[];
export const authors = authorsJson as Author[];
export const categories = categoriesJson as Category[];
export const bundles = bundlesJson as Bundle[];
export const posts = postsJson as Post[];

const byId = new Map(products.map((p) => [p.id, p]));
const bySlug = new Map(products.map((p) => [p.slug, p]));

/**
 * Admin-created products live only in the visitor's browser (store/admin-catalog.ts).
 * The store registers them here so lookups (cart, checkout, library, wishlist) can resolve them.
 * `extraAll` includes unpublished items (a buyer keeps access); `extraPublished` is what listings show.
 */
let extraAll = new Map<string, Product>();
let extraPublished: Product[] = [];

export function setExtraProducts(all: Product[], published: Product[]): void {
  extraAll = new Map(all.map((p) => [p.id, p]));
  extraPublished = published;
}

/** Published admin products (browser only; empty during static render). */
export const extraProducts = (): Product[] => extraPublished;

/** Seeded catalogue (empty: the store ships with no files) plus published admin products. */
export const allProducts = (): Product[] => [...extraPublished, ...products];

/** Where a product's page lives: static pages for seeded items (none today), a client route for admin items. */
export const productHref = (p: Pick<Product, 'id' | 'slug'>): string =>
  extraAll.has(p.id) || p.id.startsWith('adm-')
    ? `/product/view/?id=${encodeURIComponent(p.id)}`
    : `/product/${p.slug}/`;
const authorById = new Map(authors.map((a) => [a.id, a]));
const categoryById = new Map(categories.map((c) => [c.id, c]));

export const getProduct = (id: string): Product | undefined => byId.get(id) ?? extraAll.get(id);
export const getProductBySlug = (slug: string): Product | undefined => bySlug.get(slug);
export const getAuthor = (id: string): Author | undefined => authorById.get(id);
export const getCategory = (id: string): Category | undefined => categoryById.get(id);
export const getBundle = (id: string): Bundle | undefined => bundles.find((b) => b.id === id);
export const getPost = (slug: string): Post | undefined => posts.find((p) => p.slug === slug);

export const authorName = (id: string): string =>
  authorById.get(id)?.name ?? (id === 'leafpress-studio' ? 'Cheat & Anal Studio' : 'سازندهٔ ناشناس');

export const productsByAuthor = (authorId: string): Product[] =>
  allProducts().filter((p) => p.authorId === authorId);

/** Free files: seeded (none) plus the given published admin products. */
export const freeProducts = (extra: Product[] = []): Product[] =>
  [...extra, ...products].filter((p) => (p.salePrice ?? p.price) === 0);

/** Placeholder slug for /product/[slug]: static export needs at least one param, and the store ships empty. */
export const PLACEHOLDER_SLUG = 'unavailable';

/** Slugs to pre-render under /product/[slug]: the seeded catalogue, or the placeholder when it is empty. */
export const productSlugs = (): string[] =>
  products.length ? products.map((p) => p.slug) : [PLACEHOLDER_SLUG];

/** Featured products for the home slider: the 12 best-rated paid seeded files (none while the store is empty). */
export const featuredProducts = (): Product[] => {
  const ranked = [...products]
    .filter((p) => p.price > 0)
    .sort((a, b) => b.rating * Math.log(b.votes + 1) - a.rating * Math.log(a.votes + 1))
    .slice(0, 12);
  // Lead with the best website template: a site screenshot makes the strongest first slide.
  const lead = ranked.find((p) => p.category === 'templates');
  return lead ? [lead, ...ranked.filter((p) => p !== lead)] : ranked;
};

export const relatedProducts = (product: Product, count = 4): Product[] => {
  const pool = allProducts();
  const same = pool.filter((p) => p.id !== product.id && p.category === product.category);
  const others = pool.filter(
    (p) =>
      p.id !== product.id && p.category !== product.category && p.tags.some((t) => product.tags.includes(t)),
  );
  const rest = pool.filter((p) => p.id !== product.id && !same.includes(p) && !others.includes(p));
  return [...same, ...others, ...rest].slice(0, count);
};

/** Authors by lifetime sales, then by name (all start at zero sales now the store ships empty). */
export const topAuthors = (): Author[] =>
  [...authors].sort((a, b) => b.sales - a.sales || a.name.localeCompare(b.name));

/** File types that exist in the shop right now (seeded + published admin items), for the filter. */
export const allFileTypes = (selected: string[] = []): string[] => fileTypeOptions(allProducts(), selected);
export const allCompatibility = (): string[] =>
  [...new Set(allProducts().flatMap((p) => p.compatibility ?? []))].sort();
export const allTags = (): { tag: string; count: number }[] => {
  const m = new Map<string, number>();
  allProducts().forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return [...m.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
};
export interface CloudTag {
  tag: string;
  count: number;
  href: string;
  /** Set for game tags (lib/games.ts), which are listed even before any product uses them. */
  game?: string;
}

/** Sidebar tag cloud: every game tag (linked to the game filter), then other product tags by use. */
export const tagCloud = (): CloudTag[] => {
  const list = allProducts();
  const games: CloudTag[] = GAMES.map((g) => ({
    tag: g.name,
    count: list.filter((p) => productGames(p).includes(g.id)).length,
    href: gameHref(g.id),
    game: g.id,
  }));
  const other: CloudTag[] = allTags()
    .filter((t) => !gameFor(t.tag))
    .map((t) => ({ ...t, href: `/shop/?q=${encodeURIComponent(t.tag)}` }));
  return [...games, ...other];
};
/** Top of the price filter: the dearest listed file, or 100 when there are no files yet. */
export const maxPrice = (): number => {
  const prices = allProducts().map((p) => p.price);
  return prices.length ? Math.max(0, ...prices) : 100;
};

/** Seeded ids were p01–p36. They are gone; carts, wishlists and libraries saved before are pruned of them. */
export const isRetiredSeedId = (id: string): boolean => /^p\d{2}$/.test(id);

/** Copy for a list with nothing in it yet. */
export const NO_FILES_TITLE = 'هنوز فایلی نیست';

/** Products of one category from a list (seeded + admin), newest first. */
export const productsInCategory = (list: Product[], categoryId: string): Product[] =>
  list
    .filter((p) => p.category === categoryId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

/** Empty-state line for a category page, e.g. "هنوز در «چیت‌ها» فایلی نیست — به‌زودی سر بزن". */
export const categoryEmptyText = (c: Pick<Category, 'name'>): string =>
  `هنوز در «${c.name}» فایلی نیست — به‌زودی دوباره سر بزن`;
