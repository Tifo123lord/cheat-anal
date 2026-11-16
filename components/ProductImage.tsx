'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { IDB_PREFIX } from '@/lib/admin-products';
import { artSvg, productImage, svgDataUri } from '@/lib/art';
import { getBlob } from '@/lib/blobstore';
import type { Product } from '@/lib/types';

interface Props {
  product: Pick<Product, 'images' | 'title'>;
  index?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/** Object URL for an uploaded preview stored in IndexedDB (null while loading or when missing). */
function useBlobUrl(key: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!key) {
      setUrl(null);
      return undefined;
    }
    let alive = true;
    let made: string | null = null;
    getBlob(key)
      .then((b) => {
        if (!alive || !b) return;
        made = URL.createObjectURL(b);
        setUrl(made);
      })
      .catch(() => setUrl(null));
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [key]);
  return url;
}

/**
 * Product preview in a fixed 16:10 box (no layout shift): a generated SVG for catalogue items,
 * or an admin-uploaded image read from IndexedDB (generated art shows while it loads or if it is missing).
 */
export default function ProductImage({
  product,
  index = 0,
  alt,
  className = '',
  priority = false,
  sizes,
}: Props) {
  const d = product.images[index] ?? product.images[0] ?? 'gradient:0';
  const key = d.startsWith(IDB_PREFIX) ? d.slice(IDB_PREFIX.length) : null;
  const blobUrl = useBlobUrl(key);
  const src = useMemo(
    () => (key ? svgDataUri(artSvg(`gradient:${index}`, product.title)) : productImage(product, index)),
    [key, product, index],
  );
  if (key) {
    return (
      <span className={`relative block aspect-[16/10] w-full overflow-hidden ${className}`}>
        <Image
          src={blobUrl ?? src}
          alt={alt ?? `Preview of ${product.title}`}
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, 300px'}
          unoptimized
          className="object-cover"
        />
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt ?? `Preview of ${product.title}`}
      width={320}
      height={200}
      sizes={sizes ?? '(max-width: 768px) 100vw, 300px'}
      priority={priority}
      unoptimized
      className={`block h-auto w-full ${className}`}
    />
  );
}
