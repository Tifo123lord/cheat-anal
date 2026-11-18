import { normalizeChip } from './file-types';
import type { LicenseType, Product } from './types';

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'rating', label: 'بیشترین امتیاز' },
  { value: 'price-asc', label: 'قیمت: ارزان به گران' },
  { value: 'price-desc', label: 'قیمت: گران به ارزان' },
];

export interface Filters {
  q: string;
  categories: string[];
  fileTypes: string[];
  compatibility: string[];
  licenses: LicenseType[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
  sort: SortKey;
  page: number;
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  categories: [],
  fileTypes: [],
  compatibility: [],
  licenses: [],
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  sort: 'newest',
  page: 1,
};

const isSort = (s: string): s is SortKey => SORT_OPTIONS.some((o) => o.value === s);
const isLicense = (s: string): s is LicenseType => s === 'Personal' || s === 'Commercial' || s === 'Extended';
const list = (v: string | null): string[] =>
  v
    ? v
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
const num = (v: string | null): number | null => {
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

interface ParamsLike {
  get(name: string): string | null;
}

export function parseFilters(params: ParamsLike): Filters {
  const sort = params.get('sort') ?? '';
  const page = Number(params.get('page') ?? '1');
  const rating = Number(params.get('rating') ?? '0');
  return {
    q: (params.get('q') ?? '').slice(0, 80),
    categories: list(params.get('category')),
    fileTypes: [...new Set(list(params.get('type')).map(normalizeChip).filter(Boolean))],
    compatibility: list(params.get('compat')),
    licenses: list(params.get('license')).filter(isLicense),
    minPrice: num(params.get('min')),
    maxPrice: num(params.get('max')),
    minRating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0,
    sort: isSort(sort) ? sort : 'newest',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function filtersToQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.categories.length) p.set('category', f.categories.join(','));
  if (f.fileTypes.length) p.set('type', f.fileTypes.join(','));
  if (f.compatibility.length) p.set('compat', f.compatibility.join(','));
  if (f.licenses.length) p.set('license', f.licenses.join(','));
  if (f.minPrice !== null) p.set('min', String(f.minPrice));
  if (f.maxPrice !== null) p.set('max', String(f.maxPrice));
  if (f.minRating > 0) p.set('rating', String(f.minRating));
  if (f.sort !== 'newest') p.set('sort', f.sort);
  if (f.page > 1) p.set('page', String(f.page));
  return p.toString();
}

const price = (p: Product): number => p.salePrice ?? p.price;

export function matchesQuery(p: Product, q: string, authorName = ''): boolean {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = [p.title, p.description, p.category, authorName, ...p.tags, ...p.fileTypes]
    .join(' ')
    .toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export function applyFilters(
  items: Product[],
  f: Filters,
  authorName: (id: string) => string = () => '',
): Product[] {
  return items.filter((p) => {
    if (f.q && !matchesQuery(p, f.q, authorName(p.authorId))) return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.fileTypes.length && !p.fileTypes.some((t) => f.fileTypes.includes(t.toUpperCase()))) return false;
    if (f.compatibility.length && !p.compatibility.some((c) => f.compatibility.includes(c))) return false;
    if (f.licenses.length && !f.licenses.every((l) => p.licenses.some((x) => x.type === l))) return false;
    if (f.minPrice !== null && price(p) < f.minPrice) return false;
    if (f.maxPrice !== null && price(p) > f.maxPrice) return false;
    if (f.minRating > 0 && p.rating < f.minRating) return false;
    return true;
  });
}

export function sortProducts(items: Product[], sort: SortKey): Product[] {
  const out = [...items];
  const tie = (a: Product, b: Product): number => a.id.localeCompare(b.id);
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => price(a) - price(b) || tie(a, b));
    case 'price-desc':
      return out.sort((a, b) => price(b) - price(a) || tie(a, b));
    case 'popular':
      return out.sort((a, b) => b.sales - a.sales || tie(a, b));
    case 'rating':
      return out.sort((a, b) => b.rating - a.rating || b.votes - a.votes || tie(a, b));
    case 'newest':
    default:
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || tie(a, b));
  }
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { items: T[]; pages: number; page: number } {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * perPage, current * perPage), pages, page: current };
}

export function activeFilterCount(f: Filters): number {
  return (
    f.categories.length +
    f.fileTypes.length +
    f.compatibility.length +
    f.licenses.length +
    (f.minPrice !== null ? 1 : 0) +
    (f.maxPrice !== null ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0)
  );
}
