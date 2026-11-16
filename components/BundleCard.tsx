'use client';

import Link from 'next/link';
import { getProduct, productHref } from '@/lib/catalog';
import { money } from '@/lib/format';
import { bundlePrice, bundleValue } from '@/lib/pricing';
import type { Bundle } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/hydration';
import { useUI } from '@/store/ui';
import ProductImage from './ProductImage';

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const hydrated = useHydrated();
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines.some((l) => l.kind === 'bundle' && l.id === bundle.id));
  const toast = useUI((s) => s.toast);
  const value = bundleValue(bundle, getProduct);
  const price = bundlePrice(bundle);
  const items = bundle.productIds.map((id) => getProduct(id)).filter((p) => p !== undefined);
  const save = Math.round((1 - price / value) * 100);
  return (
    <article className="card frame on-paper p-3" aria-labelledby={`b-${bundle.id}`}>
      <div className="flex items-start justify-between gap-2">
        <h2
          id={`b-${bundle.id}`}
          className="font-serif text-[17px] font-bold text-[color:var(--link-strong)]"
        >
          {bundle.title}
        </h2>
        <p className="shrink-0 text-right">
          <span className="block font-display text-[20px] font-bold text-ink">{money(price)}</span>
          <s className="text-[11px] text-ink-muted">{money(value)} value</s>
        </p>
      </div>
      <p className="text-[12px] text-ink">{bundle.description}</p>
      <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={productHref(p)} className="block">
              <span className="inset-img block overflow-hidden">
                <ProductImage product={p} alt="" sizes="140px" />
              </span>
              <span className="mt-1 block truncate text-[11px] font-semibold text-ink hover:underline">
                {p.title.split(' — ')[0]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#c2b99f] pt-2">
        <span className="rounded bg-sale px-1.5 py-0.5 text-[11px] font-bold text-white">Save {save}%</span>
        <button
          type="button"
          className="btn"
          onClick={() => {
            add({ kind: 'bundle', id: bundle.id, license: 'Personal' });
            toast(`${bundle.title} bundle added to cart`);
          }}
        >
          {hydrated && inCart ? 'In cart ✓' : 'Add bundle to cart'}
        </button>
      </div>
    </article>
  );
}
