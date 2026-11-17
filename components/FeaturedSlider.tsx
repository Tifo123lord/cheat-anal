'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { darkImageIndex } from '@/lib/art';
import { authorName, productHref } from '@/lib/catalog';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';
import { sortProducts } from '@/lib/filters';
import { featuredAdminProducts, useAdminCatalog, usePublishedAdminProducts } from '@/store/admin-catalog';
import { useCart } from '@/store/cart';
import CreamFrame from './CreamFrame';
import { ArrowRight } from './Icons';
import ProductImage from './ProductImage';

const INTERVAL = 6000;
const SLIDER_FALLBACK = 5;

export default function FeaturedSlider({ items: seeded }: { items: Product[] }) {
  const records = useAdminCatalog((s) => s.records);
  const published = usePublishedAdminProducts();
  const items = useMemo(() => {
    const featured = featuredAdminProducts(records);
    // Nothing marked featured (and no seeded files): lead with the newest admin uploads instead.
    const extra =
      featured.length || seeded.length
        ? featured
        : sortProducts(published, 'newest').slice(0, SLIDER_FALLBACK);
    return extra.length ? [...extra, ...seeded] : seeded;
  }, [records, published, seeded]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const startX = useRef<number | null>(null);
  const router = useRouter();
  const add = useCart((s) => s.add);
  const count = items.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    if (paused || reduced || count < 2) return undefined;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [index, paused, reduced, count, go]);

  // An empty store has nothing to feature: the slider hides and the grid below shows the empty panel.
  const current = items[index] ?? items[0];
  if (!current) return null;

  return (
    <CreamFrame double as="section" label="Featured files" className="select-none">
      <div
        className="relative overflow-hidden rounded-[3px] border border-[#5d5847] bg-[#141410]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured files"
        tabIndex={0}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(index - 1);
          }
        }}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="relative aspect-[16/10]" aria-live={paused ? 'polite' : 'off'}>
          {items.map((p, i) => (
            <div
              key={p.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${p.title}`}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {Math.abs(i - index) <= 1 || (index === count - 1 && i === 0) ? (
                <ProductImage
                  product={p}
                  index={darkImageIndex(p)}
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 610px"
                  className="h-full object-cover"
                  alt={`Featured: ${p.title}`}
                />
              ) : null}
            </div>
          ))}

          {/* Featured ribbon */}
          <div className="absolute -left-8 top-3 w-32 -rotate-45 bg-gradient-to-b from-[#e0102a] to-leaf-dark py-0.5 text-center text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
            Featured
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-10 sm:p-4 sm:pt-14">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff8a96]">
                by {authorName(current.authorId)}
              </p>
              <h2 className="brand-heading truncate text-[15px] leading-tight text-white sm:text-[22px]">
                <Link href={productHref(current)} className="hover:underline" tabIndex={0}>
                  {current.title}
                </Link>
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-display text-[18px] font-bold text-white sm:text-[22px]">
                {money(current.salePrice ?? current.price)}
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  add({ kind: 'product', id: current.id, license: 'Personal' });
                  router.push('/cart/');
                }}
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* bottom strip: dots left, NEXT right */}
        <div className="flex items-center justify-between gap-2 border-t border-[#3a382b] bg-gradient-to-b from-[#2a2920] to-[#17160f] px-2.5 py-1.5">
          <div className="flex flex-wrap items-center gap-[5px]" role="tablist" aria-label="Choose slide">
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${p.title}`}
                onClick={() => go(i)}
                className={`h-[9px] w-[9px] rounded-full border border-[#8f8a70] ${i === index ? 'bg-[#e9e3d3]' : 'bg-transparent hover:bg-[#8f8a70]'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-[#e9e3d3] hover:text-white"
            aria-label="Next slide"
          >
            Next <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </CreamFrame>
  );
}
