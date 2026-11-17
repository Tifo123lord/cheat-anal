import { describe, expect, it } from 'vitest';
import { bundles, getBundle, getProduct } from '@/lib/catalog';
import {
  BUNDLE_LICENSE_MULTIPLIER,
  TAX_RATE,
  bundlePrice,
  cartTotals,
  findCoupon,
  licensePrice,
  listLicensePrice,
  type Lookups,
} from '@/lib/pricing';
import type { Bundle, CartLine, Product } from '@/lib/types';

const base: Product = {
  id: 'x1',
  slug: 'x1',
  title: 'Test — File',
  description: '',
  price: 20,
  category: 'fonts',
  tags: [],
  fileTypes: ['OTF'],
  fileSize: '1 MB',
  version: '1.0.0',
  compatibility: [],
  licenses: [
    { type: 'Personal', price: 20 },
    { type: 'Commercial', price: 50 },
    { type: 'Extended', price: 200 },
  ],
  images: ['type:1'],
  authorId: 'a',
  rating: 4,
  votes: 10,
  sales: 1,
  badges: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
};
const onSale: Product = { ...base, id: 'x2', salePrice: 15 };
const bundle: Bundle = { id: 'b', title: 'B', description: '', productIds: ['x1', 'x2'], price: 30 };
const lookups: Lookups = {
  product: (id) => [base, onSale].find((p) => p.id === id),
  bundle: (id) => (id === 'b' ? bundle : undefined),
};

describe('licence pricing', () => {
  it('returns the tier price for each licence', () => {
    expect(licensePrice(base, 'Personal')).toBe(20);
    expect(licensePrice(base, 'Commercial')).toBe(50);
    expect(licensePrice(base, 'Extended')).toBe(200);
  });

  it('applies the sale ratio to every tier', () => {
    expect(licensePrice(onSale, 'Personal')).toBe(15);
    expect(licensePrice(onSale, 'Commercial')).toBe(37.5);
    expect(licensePrice(onSale, 'Extended')).toBe(150);
    expect(listLicensePrice(onSale, 'Commercial')).toBe(50);
  });

  it('falls back to the first tier when a licence is not offered', () => {
    const free: Product = {
      ...base,
      price: 0,
      licenses: [
        { type: 'Personal', price: 0 },
        { type: 'Commercial', price: 9 },
      ],
    };
    expect(licensePrice(free, 'Extended')).toBe(0);
    expect(licensePrice(free, 'Commercial')).toBe(9);
  });

  it('higher licences never cost less than Personal', () => {
    for (const p of [base, onSale]) {
      const personal = licensePrice(p, 'Personal');
      for (const l of p.licenses) expect(licensePrice(p, l.type)).toBeGreaterThanOrEqual(personal);
    }
  });

  it('prices bundles by licence multiplier', () => {
    expect(bundlePrice(bundle)).toBe(30);
    expect(bundlePrice(bundle, 'Commercial')).toBe(30 * BUNDLE_LICENSE_MULTIPLIER.Commercial);
    expect(bundlePrice(bundle, 'Extended')).toBe(300);
  });
});

describe('coupon logic', () => {
  it('accepts LEAF15 in any case with surrounding spaces', () => {
    expect(findCoupon('LEAF15')).toEqual({ code: 'LEAF15', percent: 15 });
    expect(findCoupon('  leaf15 ')?.percent).toBe(15);
  });

  it('rejects unknown and empty codes', () => {
    expect(findCoupon('LEAF20')).toBeNull();
    expect(findCoupon('')).toBeNull();
    expect(findCoupon('   ')).toBeNull();
  });
});

describe('cart totals', () => {
  const lines: CartLine[] = [
    { kind: 'product', id: 'x1', license: 'Commercial' },
    { kind: 'product', id: 'x2', license: 'Personal' },
    { kind: 'bundle', id: 'b', license: 'Personal' },
  ];

  it('sums lines, adds tax and no discount without a coupon', () => {
    const t = cartTotals(lines, lookups);
    expect(t.subtotal).toBe(95);
    expect(t.discount).toBe(0);
    expect(t.tax).toBe(Math.round(95 * TAX_RATE * 100) / 100);
    expect(t.total).toBe(102.6);
    expect(t.coupon).toBeNull();
  });

  it('applies 15% before tax with LEAF15', () => {
    const t = cartTotals(lines, lookups, 'leaf15');
    expect(t.discount).toBe(14.25);
    expect(t.tax).toBe(6.46);
    expect(t.total).toBe(87.21);
  });

  it('ignores unknown items and handles an empty cart', () => {
    expect(cartTotals([{ kind: 'product', id: 'nope', license: 'Personal' }], lookups).total).toBe(0);
    expect(cartTotals([], lookups, 'LEAF15')).toMatchObject({ subtotal: 0, discount: 0, tax: 0, total: 0 });
  });

  it('works with the real (empty) catalogue', () => {
    const t = cartTotals(
      bundles.map((b) => ({ kind: 'bundle', id: b.id, license: 'Personal' })),
      { product: getProduct, bundle: getBundle },
      'LEAF15',
    );
    expect(t.subtotal).toBe(bundles.reduce((s, b) => s + b.price, 0));
    expect(t.total).toBeCloseTo((t.subtotal - t.discount) * (1 + TAX_RATE), 1);
    expect(
      cartTotals([{ kind: 'product', id: 'p01', license: 'Personal' }], {
        product: getProduct,
        bundle: getBundle,
      }).total,
    ).toBe(0);
  });
});
