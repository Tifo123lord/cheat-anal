import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ items, label }: { items: Product[]; label?: string }) {
  return (
    <ul className="grid grid-cols-1 gap-[14px] md:grid-cols-2" aria-label={label}>
      {items.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < 2} />
        </li>
      ))}
    </ul>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-[14px] md:grid-cols-2" aria-busy="true" aria-label="Loading files">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="frame p-[7px]">
          <div className="skeleton mb-2 h-4 w-2/3" />
          <div className="skeleton aspect-[16/10] w-full" />
          <div className="skeleton mt-2 h-3 w-1/2" />
          <div className="skeleton mt-2 h-3 w-full" />
        </li>
      ))}
    </ul>
  );
}
