'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { EyeIcon, SearchIcon } from './Icons';
import Modal from './Modal';
import ProductImage from './ProductImage';

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState('50% 50%');
  const [zoomed, setZoomed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [live, setLive] = useState(false);

  return (
    <div>
      <div
        className="inset-img relative cursor-zoom-in overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(
            `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`,
          );
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setLightbox(true)}
      >
        <div
          style={{ transform: zoomed ? 'scale(1.8)' : 'none', transformOrigin: origin }}
          className="transition-transform duration-200 motion-reduce:transition-none"
        >
          <ProductImage
            product={product}
            index={active}
            priority
            sizes="(max-width: 768px) 100vw, 610px"
            alt={`${product.title}, preview ${active + 1} of ${product.images.length}`}
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <ul className="flex gap-2" aria-label="Choose preview">
          {product.images.map((_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show preview ${i + 1}`}
                aria-pressed={i === active}
                className={`block w-[72px] overflow-hidden rounded-sm border-2 sm:w-[88px] ${i === active ? 'border-leaf-dark' : 'border-[#a49b82] opacity-80 hover:opacity-100'}`}
              >
                <ProductImage product={product} index={i} alt="" sizes="88px" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => setLightbox(true)}>
            <SearchIcon size={13} /> Zoom
          </button>
          <button type="button" className="btn-olive" onClick={() => setLive(true)}>
            <EyeIcon size={13} /> Live preview
          </button>
        </div>
      </div>

      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        title={`${product.title}: preview ${active + 1}`}
        wide
      >
        <div className="inset-img overflow-hidden">
          <ProductImage product={product} index={active} sizes="820px" />
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {product.images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? 'btn' : 'btn-ghost'}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={live} onClose={() => setLive(false)} title="Live preview" wide>
        <div className="overflow-hidden rounded-md border border-[#5d5847] bg-[#23221a]">
          <div className="flex items-center gap-2 border-b border-[#3a382b] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e86a5c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e8c25c]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7fc25c]" />
            <span className="ml-2 min-w-0 flex-1 truncate rounded-full bg-[#3a382b] px-3 py-0.5 text-[11px] text-[#d9d4c2]">
              preview.cheat-anal.example/{product.slug}
            </span>
          </div>
          <div className="grid gap-1 p-1 sm:grid-cols-[2fr_1fr]">
            <ProductImage product={product} index={0} sizes="540px" />
            <div className="hidden flex-col gap-1 sm:flex">
              <ProductImage product={product} index={1} sizes="270px" alt="" />
              <ProductImage product={product} index={2} sizes="270px" alt="" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-[12px] text-ink-muted">
          This is an interactive demo of the file as it ships. Purchase to download the editable source.
        </p>
      </Modal>
    </div>
  );
}
