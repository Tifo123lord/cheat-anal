'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { authorName, getCategory, products } from '@/lib/catalog';
import { usePublishedAdminProducts } from '@/store/admin-catalog';
import {
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  filtersToQuery,
  paginate,
  parseFilters,
  sortProducts,
  type Filters,
  type SortKey,
} from '@/lib/filters';
import { plural } from '@/lib/format';
import EmptyState from './EmptyState';
import FiltersPanel from './FiltersPanel';
import { CloseIcon, FilterIcon } from './Icons';
import { TwoColumn } from './Layout';
import Modal from './Modal';
import Pagination from './Pagination';
import ProductGrid from './ProductGrid';

const PER_PAGE = 12;

export default function ShopView({
  title = 'Shop all files',
  defaultSort,
}: {
  title?: string;
  defaultSort?: SortKey;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/shop/';
  const [sheet, setSheet] = useState(false);
  const fromUrl = useMemo(() => {
    const f = parseFilters(params);
    return defaultSort && !params.get('sort') ? { ...f, sort: defaultSort } : f;
  }, [params, defaultSort]);
  // Optimistic copy so controls respond instantly; the URL stays the source of truth.
  const [filters, setFilters] = useState<Filters>(fromUrl);
  useEffect(() => setFilters(fromUrl), [fromUrl]);

  const update = (f: Filters) => {
    setFilters(f);
    const qs = filtersToQuery(defaultSort && f.sort === defaultSort ? { ...f, sort: 'newest' } : f);
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const adminItems = usePublishedAdminProducts();
  const results = useMemo(
    () => sortProducts(applyFilters([...adminItems, ...products], filters, authorName), filters.sort),
    [filters, adminItems],
  );
  const { items, pages, page } = paginate(results, filters.page, PER_PAGE);
  const active = activeFilterCount(filters);

  const chips: { label: string; clear: Partial<Filters> }[] = [
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: { q: '' } }] : []),
    ...filters.categories.map((c) => ({
      label: getCategory(c)?.name ?? c,
      clear: { categories: filters.categories.filter((x) => x !== c) },
    })),
    ...filters.fileTypes.map((t) => ({
      label: t,
      clear: { fileTypes: filters.fileTypes.filter((x) => x !== t) },
    })),
    ...filters.compatibility.map((t) => ({
      label: t,
      clear: { compatibility: filters.compatibility.filter((x) => x !== t) },
    })),
    ...filters.licenses.map((t) => ({
      label: `${t} licence`,
      clear: { licenses: filters.licenses.filter((x) => x !== t) },
    })),
    ...(filters.minPrice !== null ? [{ label: `from $${filters.minPrice}`, clear: { minPrice: null } }] : []),
    ...(filters.maxPrice !== null
      ? [{ label: filters.maxPrice === 0 ? 'Free' : `to $${filters.maxPrice}`, clear: { maxPrice: null } }]
      : []),
    ...(filters.minRating > 0 ? [{ label: `${filters.minRating}+ leaves`, clear: { minRating: 0 } }] : []),
  ];

  const aside = (
    <aside aria-labelledby="filters-h" className="frame on-paper hidden overflow-hidden lg:block">
      <h2
        id="filters-h"
        className="border-b border-[#bcb399] px-3 py-2.5 font-display text-[15px] font-bold text-ink"
      >
        Filter files
      </h2>
      <FiltersPanel filters={filters} onChange={update} idPrefix="side" />
    </aside>
  );

  return (
    <TwoColumn aside={aside}>
      <div className="frame on-paper mb-[14px] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="page-title !text-[19px]">{title}</h1>
            <p className="text-[12px] text-ink-muted" aria-live="polite">
              {plural(results.length, 'file')} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-olive lg:hidden"
              onClick={() => setSheet(true)}
              aria-haspopup="dialog"
            >
              <FilterIcon size={13} /> Filters{active ? ` (${active})` : ''}
            </button>
            <label htmlFor="sort" className="text-[12px] font-bold text-ink">
              Sort
            </label>
            <select
              id="sort"
              className="field !w-auto !py-1.5"
              value={filters.sort}
              onChange={(e) => update({ ...filters, sort: e.target.value as SortKey, page: 1 })}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {chips.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.label}>
                <button
                  type="button"
                  onClick={() => update({ ...filters, ...c.clear, page: 1 })}
                  className="inline-flex items-center gap-1 rounded-full border border-[#8f8770] bg-paper-light px-2 py-0.5 text-[11px] font-semibold text-ink hover:bg-white"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label} <CloseIcon size={10} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length ? (
        <ProductGrid items={items} label="Search results" />
      ) : (
        <div className="frame on-paper">
          <EmptyState title="Nothing sprouted here">
            No files match these filters. Try removing one, or{' '}
            <button
              type="button"
              className="link"
              onClick={() => update({ ...parseFilters(new URLSearchParams()) })}
            >
              clear everything
            </button>
            .
          </EmptyState>
        </div>
      )}
      <div className="mt-5">
        <Pagination page={page} pages={pages} onPage={(p) => update({ ...filters, page: p })} />
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title="Filter files" variant="sheet">
        <FiltersPanel filters={filters} onChange={update} idPrefix="sheet" />
        <div className="sticky bottom-0 bg-paper px-3 pb-3 pt-1">
          <button type="button" className="btn w-full" onClick={() => setSheet(false)}>
            Show {plural(results.length, 'file')}
          </button>
        </div>
      </Modal>
    </TwoColumn>
  );
}
