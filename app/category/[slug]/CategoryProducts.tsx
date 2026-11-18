'use client';

import { useMemo } from 'react';
import EmptyState from '@/components/EmptyState';
import ProductGrid, { GridSkeleton } from '@/components/ProductGrid';
import { products, productsInCategory } from '@/lib/catalog';
import { plural } from '@/lib/format';
import { usePublishedAdminProducts } from '@/store/admin-catalog';
import { useHydrated } from '@/store/hydration';

/** Seeded files of a category plus the ones the admin published in this browser. */
export default function CategoryProducts({
  categoryId,
  emptyTitle,
}: {
  categoryId: string;
  emptyTitle: string;
}) {
  const hydrated = useHydrated();
  const adminItems = usePublishedAdminProducts();
  const items = useMemo(
    () => productsInCategory([...adminItems, ...products], categoryId),
    [adminItems, categoryId],
  );

  // Admin files load from localStorage after hydration; avoid flashing the empty state before that.
  if (!items.length && !hydrated) return <GridSkeleton count={2} />;
  if (!items.length) {
    return (
      <div className="frame on-paper" data-testid="category-empty">
        <EmptyState title={emptyTitle}>فایل‌های جدید به محض انتشار همین‌جا قرار می‌گیرند.</EmptyState>
      </div>
    );
  }
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {plural(items.length, 'فایل')} در این دسته‌بندی
      </p>
      <ProductGrid items={items} label="فایل‌های این دسته‌بندی" />
    </>
  );
}
