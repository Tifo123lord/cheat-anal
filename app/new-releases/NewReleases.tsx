'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import EmptyState from '@/components/EmptyState';
import ProductGrid, { GridSkeleton } from '@/components/ProductGrid';
import { NO_FILES_TITLE, products } from '@/lib/catalog';
import { sortProducts } from '@/lib/filters';
import { formatDate } from '@/lib/format';
import { usePublishedAdminProducts } from '@/store/admin-catalog';
import { useHydrated } from '@/store/hydration';

const COUNT = 12;

/** The twelve newest files: seeded (none today) plus the admin's published uploads. */
export default function NewReleases() {
  const hydrated = useHydrated();
  const adminItems = usePublishedAdminProducts();
  const newest = useMemo(
    () => sortProducts([...adminItems, ...products], 'newest').slice(0, COUNT),
    [adminItems],
  );
  return (
    <>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">New releases</h1>
        <p className="text-[12px] text-ink-muted">
          The twelve freshest files, newest first.
          {newest[0] ? ` Latest release: ${formatDate(newest[0].createdAt)}.` : ''}{' '}
          <Link href="/shop/?sort=newest" className="link">
            Browse everything by date
          </Link>
        </p>
      </div>
      {newest.length ? (
        <ProductGrid items={newest} label="New releases" />
      ) : hydrated ? (
        <div className="frame on-paper" data-testid="new-releases-empty">
          <EmptyState title={NO_FILES_TITLE}>
            New releases show up here as soon as they are published.
          </EmptyState>
        </div>
      ) : (
        <GridSkeleton count={2} />
      )}
    </>
  );
}
