import { describe, expect, it } from 'vitest';
import {
  MAX_FILE_BYTES,
  blobKeys,
  buildProduct,
  defaultImages,
  defaultLicenses,
  fileProblem,
  isAdminProductId,
  newAdminId,
  publishedProducts,
  removeRecord,
  setPublished,
  upsertRecord,
  validateInput,
  type AdminProductInput,
  type AdminRecord,
} from '@/lib/admin-products';
import { parseArt } from '@/lib/art';
import { allProducts, getProduct, productHref, products, setExtraProducts } from '@/lib/catalog';
import { applyFilters, parseFilters } from '@/lib/filters';
import { fitSize } from '@/lib/images';
import { licensePrice } from '@/lib/pricing';

const input = (over: Partial<AdminProductInput> = {}): AdminProductInput => ({
  title: 'Mossbank Notion Planner',
  description: 'A calm weekly planner template with habit trackers and a reading log.',
  category: 'templates',
  price: 20,
  salePrice: null,
  tags: ['planner', 'notion'],
  fileTypes: ['pdf', 'zip'],
  licenses: defaultLicenses(20),
  ...over,
});

const record = (id: string, over: Partial<AdminRecord> = {}): AdminRecord => ({
  product: buildProduct(input(), {
    id,
    now: '2026-11-17T10:00:00Z',
    images: [],
    categoryArt: 'browser',
    fileSize: 2048,
  }),
  published: true,
  featured: false,
  file: { key: `file-${id}`, name: 'planner.zip', size: 2048, type: 'application/zip' },
  ...over,
});

describe('admin product validation', () => {
  it('accepts a complete product', () => {
    expect(validateInput(input(), true)).toEqual({});
  });
  it('flags missing fields, bad sale price and a missing file', () => {
    const e = validateInput(
      input({ title: 'x', description: 'short', category: '', salePrice: 25, fileTypes: [], licenses: [] }),
      false,
    );
    expect(Object.keys(e).sort()).toEqual([
      'category',
      'description',
      'file',
      'fileTypes',
      'licenses',
      'salePrice',
      'title',
    ]);
  });
  it('enforces the 200 MB file limit', () => {
    expect(fileProblem(MAX_FILE_BYTES)).toBeNull();
    expect(fileProblem(MAX_FILE_BYTES + 1)).toMatch(/limit is 200\.0 MB/);
  });
});

describe('default image fallback', () => {
  it('uses the category art family when no image is uploaded', () => {
    const p = buildProduct(input(), { id: 'adm-1', now: '2026-11-17', images: [], categoryArt: 'type' });
    expect(p.images).toHaveLength(3);
    expect(p.images.every((d) => parseArt(d).kind === 'type')).toBe(true);
  });
  it('is stable for a title and differs between titles', () => {
    expect(defaultImages('Fern', 'icons')).toEqual(defaultImages('Fern', 'icons'));
    expect(defaultImages('Fern', 'icons')).not.toEqual(defaultImages('Bracken', 'icons'));
  });
  it('falls back to the gradient family without a category art', () => {
    expect(parseArt(defaultImages('x', undefined)[0]).kind).toBe('gradient');
  });
  it('keeps uploaded images (max 5) instead of the default', () => {
    const imgs = ['idb:a', 'idb:b', 'idb:c', 'idb:d', 'idb:e', 'idb:f'];
    const p = buildProduct(input(), { id: 'adm-2', now: '2026-11-17', images: imgs, categoryArt: 'type' });
    expect(p.images).toEqual(imgs.slice(0, 5));
  });
  it('resizes to at most 1600px on the long side, never upscaling', () => {
    expect(fitSize(4000, 2000)).toEqual({ width: 1600, height: 800 });
    expect(fitSize(1200, 3200)).toEqual({ width: 600, height: 1600 });
    expect(fitSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe('admin product CRUD', () => {
  it('builds a catalogue product with badges, sale price and normalised fields', () => {
    const p = buildProduct(input({ salePrice: 15 }), {
      id: 'adm-x1',
      now: '2026-11-17T10:00:00Z',
      images: [],
      fileSize: 5 * 1024 * 1024,
    });
    expect(p.badges).toEqual(['NEW', 'SALE']);
    expect(p.salePrice).toBe(15);
    expect(p.fileTypes).toEqual(['PDF', 'ZIP']);
    expect(p.fileSize).toBe('5.0 MB');
    expect(p.slug).toBe('mossbank-notion-planner-x1');
    expect(p.createdAt).toBe('2026-11-17');
    expect(licensePrice(p, 'Personal')).toBe(15);
  });
  it('edits keep identity and creation date and bump the version', () => {
    const first = buildProduct(input(), { id: 'adm-e', now: '2026-11-01', images: [] });
    const edited = buildProduct(input({ title: 'Mossbank Planner 2' }), {
      id: 'adm-e',
      now: '2026-11-17',
      images: [],
      existing: first,
    });
    expect(edited.id).toBe(first.id);
    expect(edited.createdAt).toBe('2026-11-01');
    expect(edited.updatedAt).toBe('2026-11-17');
    expect(edited.version).toBe('1.0.1');
  });
  it('creates, updates, publishes, unpublishes and deletes records', () => {
    let list: AdminRecord[] = [];
    list = upsertRecord(list, record('adm-a'));
    list = upsertRecord(list, record('adm-b', { published: false }));
    expect(publishedProducts(list).map((p) => p.id)).toEqual(['adm-a']);
    list = setPublished(list, 'adm-b', true);
    expect(publishedProducts(list)).toHaveLength(2);
    list = upsertRecord(list, { ...record('adm-a'), featured: true });
    expect(list).toHaveLength(2);
    expect(list.find((r) => r.product.id === 'adm-a')?.featured).toBe(true);
    list = setPublished(list, 'adm-a', false);
    expect(publishedProducts(list).map((p) => p.id)).toEqual(['adm-b']);
    list = removeRecord(list, 'adm-b');
    expect(list.map((r) => r.product.id)).toEqual(['adm-a']);
  });
  it('lists the blobs a record owns for cleanup', () => {
    const r = record('adm-k');
    r.product = { ...r.product, images: ['idb:img-1', 'browser:2', 'idb:img-2'] };
    expect(blobKeys(r)).toEqual(['file-adm-k', 'img-1', 'img-2']);
  });
  it('ids are prefixed and unique', () => {
    const a = newAdminId(1, 0.1);
    expect(isAdminProductId(a)).toBe(true);
    expect(newAdminId(1, 0.2)).not.toBe(a);
  });
});

describe('catalogue registry', () => {
  it('published admin products join listings, filters and lookups; unpublished stay resolvable', () => {
    const pub = record('adm-pub').product;
    const hidden = record('adm-hidden').product;
    setExtraProducts([pub, hidden], [pub]);
    expect(allProducts()).toHaveLength(products.length + 1);
    expect(getProduct('adm-hidden')?.id).toBe('adm-hidden');
    expect(productHref(pub)).toBe('/product/view/?id=adm-pub');
    expect(productHref({ id: 'p01', slug: 'some-static-file' })).toBe('/product/some-static-file/');
    const found = applyFilters(
      allProducts(),
      parseFilters(new URLSearchParams('q=mossbank&category=templates')),
    );
    expect(found.map((p) => p.id)).toEqual(['adm-pub']);
    setExtraProducts([], []);
    expect(allProducts()).toHaveLength(products.length);
  });
});
