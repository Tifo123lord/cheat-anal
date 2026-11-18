'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authorName, getProduct, productHref } from '@/lib/catalog';
import { money } from '@/lib/format';
import { licenseLabel } from '@/lib/i18n';
import { licensePrice } from '@/lib/pricing';
import type { LicenseType } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';
import LeafRating from './LeafRating';
import Modal from './Modal';
import ProductImage from './ProductImage';

export default function QuickView() {
  const id = useUI((s) => s.quickViewId);
  const close = useUI((s) => s.closeQuickView);
  const product = id ? getProduct(id) : undefined;
  return (
    <Modal
      open={Boolean(product)}
      onClose={close}
      title={product ? `نمایش سریع: ${product.title}` : 'نمایش سریع'}
      wide
    >
      {product && <QuickViewBody key={product.id} productId={product.id} onDone={close} />}
    </Modal>
  );
}

function QuickViewBody({ productId, onDone }: { productId: string; onDone: () => void }) {
  const product = getProduct(productId);
  const [license, setLicense] = useState<LicenseType>('Personal');
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  if (!product) return null;
  return (
    <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
      <div className="inset-img overflow-hidden">
        <ProductImage product={product} priority sizes="(max-width: 768px) 100vw, 460px" />
      </div>
      <div className="text-ink">
        <p className="text-[12px] text-ink-muted">
          از <bdi>{authorName(product.authorId)}</bdi>
        </p>
        <p className="my-2 text-[13px]" dir="auto">
          {product.description}
        </p>
        <LeafRating rating={product.rating} votes={product.votes} />
        <fieldset className="mt-3">
          <legend className="label">لایسنس</legend>
          {product.licenses.map((l) => (
            <label key={l.type} className="flex items-center justify-between gap-2 py-0.5 text-[13px]">
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="qv-license"
                  checked={license === l.type}
                  onChange={() => setLicense(l.type)}
                />
                {licenseLabel(l.type)}
              </span>
              <span className="font-bold">{money(licensePrice(product, l.type))}</span>
            </label>
          ))}
        </fieldset>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn"
            data-autofocus
            onClick={() => {
              add({ kind: 'product', id: product.id, license });
              toast(`با لایسنس ${licenseLabel(license)} به سبد اضافه شد`);
              onDone();
            }}
          >
            افزودن به سبد · {money(licensePrice(product, license))}
          </button>
          <Link href={productHref(product)} className="btn-ghost" onClick={onDone}>
            جزئیات کامل
          </Link>
        </div>
      </div>
    </div>
  );
}
