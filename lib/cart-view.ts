import { getBundle, getProduct, productHref } from './catalog';
import { cartTotals, linePrice, type Lookups, type Totals } from './pricing';
import type { CartLine, LicenseType } from './types';

export const lookups: Lookups = { product: getProduct, bundle: getBundle };

export interface CartRow {
  line: CartLine;
  title: string;
  href: string;
  price: number;
  licenses: LicenseType[];
  images: string[];
  subtitle: string;
}

export function cartRows(lines: CartLine[]): CartRow[] {
  return lines.flatMap((line): CartRow[] => {
    if (line.kind === 'bundle') {
      const b = getBundle(line.id);
      if (!b) return [];
      const first = getProduct(b.productIds[0] ?? '');
      return [
        {
          line,
          title: `${b.title} bundle`,
          href: '/bundles/',
          price: linePrice(line, lookups),
          licenses: ['Personal', 'Commercial', 'Extended'],
          images: first?.images ?? ['gradient:1'],
          subtitle: `${b.productIds.length} files`,
        },
      ];
    }
    const p = getProduct(line.id);
    if (!p) return [];
    return [
      {
        line,
        title: p.title,
        href: productHref(p),
        price: linePrice(line, lookups),
        licenses: p.licenses.map((l) => l.type),
        images: p.images,
        subtitle: p.fileTypes.join(' · '),
      },
    ];
  });
}

export const totalsFor = (lines: CartLine[], coupon: string): Totals => cartTotals(lines, lookups, coupon);

export const slugFor = (kind: 'product' | 'bundle', id: string): string =>
  kind === 'bundle' ? `bundle-${getBundle(id)?.id ?? id}` : (getProduct(id)?.slug ?? id);
