'use client';

import { useMemo, useState } from 'react';
import { paginate, sortProducts } from '@/lib/filters';
import { usePublishedAdminProducts } from '@/store/admin-catalog';
import type { Product } from '@/lib/types';
import Pagination from './Pagination';
import ProductCard from './ProductCard';

const PER_PAGE = 8;

/** Two-column grid of cream cards with numbered pagination and a "Load more" option. */
export default function HomeGrid({ items: seeded }: { items: Product[] }) {
  const adminItems = usePublishedAdminProducts();
  const items = useMemo(
    () => (adminItems.length ? sortProducts([...adminItems, ...seeded], 'newest') : seeded),
    [adminItems, seeded],
  );
  const [page, setPage] = useState(1);
  const [extra, setExtra] = useState(0);
  const { items: pageItems, pages } = paginate(items, page, PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const shown = items.slice(start, start + PER_PAGE * (1 + extra));
  const canLoadMore = start + shown.length < items.length;
  const list = extra > 0 ? shown : pageItems;

  return (
    <section aria-labelledby="latest-h" className="mt-4">
      <h2 id="latest-h" className="sr-only">
        Latest files
      </h2>
      <ul className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {list.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} priority={i < 2} />
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col items-center gap-3">
        <Pagination
          page={page}
          pages={pages}
          onPage={(p) => {
            setExtra(0);
            setPage(p);
            document.getElementById('latest-h')?.parentElement?.scrollIntoView({ block: 'start' });
          }}
        />
        {canLoadMore && (
          <button type="button" className="btn-olive" onClick={() => setExtra((x) => x + 1)}>
            Load more files
          </button>
        )}
      </div>
    </section>
  );
}
