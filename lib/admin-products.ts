import { extOf, normalizeChip } from './file-types';
import { hashString } from './random';
import { LICENSE_TYPES, type ArtKind, type Badge, type LicenseType, type Product } from './types';

/** Admin products are prefixed so they never collide with the 36 seeded catalogue ids. */
export const ADMIN_ID_PREFIX = 'adm-';
export const ADMIN_AUTHOR_ID = 'leafpress-studio';
export const ADMIN_AUTHOR_NAME = 'leafpress Studio';
/** Largest downloadable file: files are kept whole in IndexedDB, which handles this comfortably. */
export const MAX_FILE_BYTES = 200 * 1024 * 1024;
export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIDE = 1600;
/** SVG and animated GIF previews are stored as uploaded, so they get their own cap. */
export const MAX_ORIGINAL_IMAGE_BYTES = 15 * 1024 * 1024;
/** Fallback MIME for uploads the browser could not type (.dll, .cfg, .lua, …). */
export const FALLBACK_MIME = 'application/octet-stream';
/** Image descriptor prefix: `idb:<key>` points at a resized upload stored in IndexedDB. */
export const IDB_PREFIX = 'idb:';

export const isAdminProductId = (id: string): boolean => id.startsWith(ADMIN_ID_PREFIX);

export interface StoredFile {
  key: string;
  name: string;
  size: number;
  type: string;
}

export interface AdminRecord {
  product: Product;
  published: boolean;
  featured: boolean;
  file: StoredFile | null;
}

export interface AdminProductInput {
  title: string;
  description: string;
  category: string;
  price: number;
  salePrice: number | null;
  tags: string[];
  fileTypes: string[];
  licenses: { type: LicenseType; price: number }[];
}

export type InputErrors = Partial<Record<keyof AdminProductInput | 'file' | 'images', string>>;

export const splitList = (s: string): string[] =>
  [
    ...new Set(
      s
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ].slice(0, 12);

export function validateInput(i: AdminProductInput, hasFile: boolean): InputErrors {
  const e: InputErrors = {};
  if (i.title.trim().length < 3) e.title = 'Give the file a title (3+ characters).';
  if (i.description.trim().length < 20) e.description = 'Write at least 20 characters.';
  if (!i.category) e.category = 'Choose a category.';
  if (!Number.isFinite(i.price) || i.price < 0) e.price = 'Price must be 0 or more.';
  if (i.salePrice !== null && (!Number.isFinite(i.salePrice) || i.salePrice < 0 || i.salePrice >= i.price))
    e.salePrice = 'Sale price must be lower than the price.';
  if (!i.fileTypes.some((t) => normalizeChip(t))) e.fileTypes = 'Add at least one file type (e.g. DLL, ZIP).';
  if (!i.licenses.length) e.licenses = 'Offer at least one licence.';
  else if (i.licenses.some((l) => !Number.isFinite(l.price) || l.price < 0))
    e.licenses = 'Licence prices must be 0 or more.';
  if (!hasFile) e.file = 'Upload the downloadable file.';
  return e;
}

export function fileProblem(size: number): string | null {
  return size > MAX_FILE_BYTES
    ? `This file is ${formatBytes(size)}; the limit is ${formatBytes(MAX_FILE_BYTES)}.`
    : null;
}

/** MIME to store and download with: the browser's guess, or a generic binary type when it had none. */
export const downloadMime = (type: string | undefined | null): string =>
  (type && type.trim()) || FALLBACK_MIME;

/** True when an error means the browser's storage quota is full. */
export function isQuotaError(ex: unknown): boolean {
  if (!ex || typeof ex !== 'object') return false;
  const { name = '', message = '' } = ex as { name?: string; message?: string };
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || /quota/i.test(message);
}

/** Friendly inline message for a failed save into IndexedDB. */
export function storageErrorMessage(ex: unknown): string {
  if (isQuotaError(ex))
    return 'This browser has run out of storage space for uploads. Delete older products or free up disk space, or use a smaller file.';
  return `Could not store the upload in this browser: ${ex instanceof Error ? ex.message : 'unknown error'}.`;
}

/** Product-page note for a downloadable file, e.g. ".dll file · 12.0 KB". */
export function fileNote(ext: string | undefined, size: string): string {
  return `${ext ? `.${ext}` : 'No extension'} file · ${size}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Default licence tiers for a price, using the same ratios as the seeded catalogue. */
export function defaultLicenses(price: number): { type: LicenseType; price: number }[] {
  return [
    { type: 'Personal', price },
    { type: 'Commercial', price: Math.round(price * 2.5) },
    { type: 'Extended', price: price * 10 },
  ];
}

/**
 * Generated SVG preview descriptors when the admin uploads no images: the category's art family,
 * with variants derived from the title so each product looks different but stays stable.
 */
export function defaultImages(title: string, categoryArt: ArtKind | undefined): string[] {
  const kind: ArtKind = categoryArt ?? 'gradient';
  const h = hashString(title.trim().toLowerCase() || 'leafpress');
  return [0, 1, 2].map((i) => `${kind}:${(h + i * 5) % 12}`);
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'file'
  );
}

export function newAdminId(now = Date.now(), rnd = Math.random()): string {
  return `${ADMIN_ID_PREFIX}${now.toString(36)}${Math.floor(rnd * 1e6).toString(36)}`;
}

/** Builds (or rebuilds on edit) the catalogue Product for an admin record. */
export function buildProduct(
  input: AdminProductInput,
  opts: {
    id: string;
    now: string;
    images: string[];
    categoryArt?: ArtKind;
    fileSize?: number;
    /** Original name of the downloadable file; its extension is shown on the product page. */
    fileName?: string;
    existing?: Product;
  },
): Product {
  const sale = input.salePrice !== null && input.salePrice < input.price ? input.salePrice : undefined;
  const badges: Badge[] = ['NEW'];
  if (sale !== undefined) badges.push('SALE');
  if (input.price === 0) badges.push('FREE');
  const day = opts.now.slice(0, 10);
  const licenses = LICENSE_TYPES.flatMap((t) => input.licenses.filter((l) => l.type === t).slice(0, 1));
  return {
    id: opts.id,
    slug: `${slugify(input.title)}-${opts.id.slice(ADMIN_ID_PREFIX.length)}`,
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.price,
    ...(sale !== undefined ? { salePrice: sale } : {}),
    category: input.category,
    tags: input.tags.map((t) => t.toLowerCase()),
    fileTypes: [...new Set(input.fileTypes.map(normalizeChip).filter(Boolean))],
    fileSize: opts.fileSize !== undefined ? formatBytes(opts.fileSize) : (opts.existing?.fileSize ?? '—'),
    ...(opts.fileName !== undefined
      ? { fileExt: extOf(opts.fileName) }
      : opts.existing?.fileExt !== undefined
        ? { fileExt: opts.existing.fileExt }
        : {}),
    version: opts.existing ? bumpPatch(opts.existing.version) : '1.0.0',
    compatibility: ['Any'],
    licenses,
    images: opts.images.length
      ? opts.images.slice(0, MAX_IMAGES)
      : defaultImages(input.title, opts.categoryArt),
    authorId: ADMIN_AUTHOR_ID,
    rating: opts.existing?.rating ?? 0,
    votes: opts.existing?.votes ?? 0,
    sales: opts.existing?.sales ?? 0,
    badges,
    createdAt: opts.existing?.createdAt ?? day,
    updatedAt: day,
  };
}

const bumpPatch = (v: string): string => {
  const [a = 1, b = 0, c = 0] = v.split('.').map((n) => Number(n) || 0);
  return `${a}.${b}.${c + 1}`;
};

export const upsertRecord = (list: AdminRecord[], rec: AdminRecord): AdminRecord[] =>
  list.some((r) => r.product.id === rec.product.id)
    ? list.map((r) => (r.product.id === rec.product.id ? rec : r))
    : [rec, ...list];

export const removeRecord = (list: AdminRecord[], id: string): AdminRecord[] =>
  list.filter((r) => r.product.id !== id);

export const setPublished = (list: AdminRecord[], id: string, published: boolean): AdminRecord[] =>
  list.map((r) => (r.product.id === id ? { ...r, published } : r));

export const publishedProducts = (list: AdminRecord[]): Product[] =>
  list.filter((r) => r.published).map((r) => r.product);

/** Blob keys (file + uploaded images) owned by a record, for cleanup on delete/replace. */
export const blobKeys = (r: AdminRecord): string[] => [
  ...(r.file ? [r.file.key] : []),
  ...r.product.images.filter((d) => d.startsWith(IDB_PREFIX)).map((d) => d.slice(IDB_PREFIX.length)),
];
