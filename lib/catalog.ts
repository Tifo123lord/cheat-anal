import productsJson from '@/data/products.json';
import authorsJson from '@/data/authors.json';
import categoriesJson from '@/data/categories.json';
import bundlesJson from '@/data/bundles.json';
import postsJson from '@/data/posts.json';
import { fileTypeOptions } from './file-types';
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

/** Seeded catalogue plus published admin products. */
export const allProducts = (): Product[] => [...extraPublished, ...products];

/** Where a product's page lives: static pages for the seeded catalogue, a client route for admin items. */
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
  authorById.get(id)?.name ?? (id === 'leafpress-studio' ? 'leafpress Studio' : 'Unknown author');

export const productsByAuthor = (authorId: string): Product[] =>
  products.filter((p) => p.authorId === authorId);

export const freeProducts = (): Product[] => products.filter((p) => p.price === 0);

/** Featured products for the home slider: the 12 best-rated paid files. */
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
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const others = products.filter(
    (p) =>
      p.id !== product.id && p.category !== product.category && p.tags.some((t) => product.tags.includes(t)),
  );
  const rest = products.filter((p) => p.id !== product.id && !same.includes(p) && !others.includes(p));
  return [...same, ...others, ...rest].slice(0, count);
};

export const topAuthors = (): Author[] => [...authors].sort((a, b) => b.sales - a.sales);

/** File types that exist in the shop right now (seeded + published admin items), for the filter. */
export const allFileTypes = (selected: string[] = []): string[] => fileTypeOptions(allProducts(), selected);
export const allCompatibility = (): string[] => [...new Set(products.flatMap((p) => p.compatibility))].sort();
export const allTags = (): { tag: string; count: number }[] => {
  const m = new Map<string, number>();
  allProducts().forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return [...m.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
};
export const maxPrice = (): number => Math.max(...allProducts().map((p) => p.price));
