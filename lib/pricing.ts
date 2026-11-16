import type { Bundle, CartLine, LicenseType, Product } from './types';

export const TAX_RATE = 0.08;

export interface Coupon {
  code: string;
  percent: number;
}

const COUPONS: Coupon[] = [{ code: 'LEAF15', percent: 15 }];

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** Validates a coupon code (case-insensitive, surrounding spaces ignored). */
export function findCoupon(code: string): Coupon | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return COUPONS.find((k) => k.code === c) ?? null;
}

/**
 * Price of a product under a licence. When the product is on sale the sale ratio
 * (salePrice / price) is applied to every licence tier.
 */
export function licensePrice(product: Product, license: LicenseType): number {
  const tier = product.licenses.find((l) => l.type === license) ?? product.licenses[0];
  if (!tier) return product.salePrice ?? product.price;
  if (product.salePrice !== undefined && product.price > 0) {
    return round2(tier.price * (product.salePrice / product.price));
  }
  return tier.price;
}

/** Undiscounted list price under a licence (for strike-through display). */
export function listLicensePrice(product: Product, license: LicenseType): number {
  return (product.licenses.find((l) => l.type === license) ?? product.licenses[0])?.price ?? product.price;
}

export function effectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}

/** Bundles are priced for the Personal licence; higher tiers multiply like single files. */
export const BUNDLE_LICENSE_MULTIPLIER: Record<LicenseType, number> = {
  Personal: 1,
  Commercial: 2.5,
  Extended: 10,
};

export function bundlePrice(bundle: Bundle, license: LicenseType = 'Personal'): number {
  return round2(bundle.price * BUNDLE_LICENSE_MULTIPLIER[license]);
}

export function bundleValue(bundle: Bundle, lookup: (id: string) => Product | undefined): number {
  return round2(
    bundle.productIds.reduce((t, id) => {
      const p = lookup(id);
      return t + (p ? licensePrice(p, 'Personal') : 0);
    }, 0),
  );
}

export interface Lookups {
  product: (id: string) => Product | undefined;
  bundle: (id: string) => Bundle | undefined;
}

export function linePrice(line: CartLine, lookups: Lookups): number {
  if (line.kind === 'bundle') {
    const b = lookups.bundle(line.id);
    return b ? bundlePrice(b, line.license) : 0;
  }
  const p = lookups.product(line.id);
  return p ? licensePrice(p, line.license) : 0;
}

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  coupon: Coupon | null;
}

export function cartTotals(lines: CartLine[], lookups: Lookups, couponCode = '', taxRate = TAX_RATE): Totals {
  const subtotal = round2(lines.reduce((t, l) => t + linePrice(l, lookups), 0));
  const coupon = findCoupon(couponCode);
  const discount = coupon ? round2((subtotal * coupon.percent) / 100) : 0;
  const tax = round2((subtotal - discount) * taxRate);
  const total = round2(subtotal - discount + tax);
  return { subtotal, discount, tax, total, coupon };
}
