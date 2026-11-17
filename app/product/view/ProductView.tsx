'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import EmptyState from '@/components/EmptyState';
import { Container } from '@/components/Layout';
import ProductDetail from '@/components/ProductDetail';
import { getProduct, relatedProducts } from '@/lib/catalog';
import { extOf } from '@/lib/file-types';
import { SITE } from '@/lib/site';
import { useAdminCatalog } from '@/store/admin-catalog';
import { useIsAdmin } from '@/store/auth';
import { useHydrated } from '@/store/hydration';

export default function ProductView() {
  const id = useSearchParams().get('id') ?? '';
  const hydrated = useHydrated();
  const isAdmin = useIsAdmin();
  const record = useAdminCatalog((s) => s.records.find((r) => r.product.id === id));
  const base = record?.product ?? (hydrated ? getProduct(id) : undefined);
  // Records saved before fileExt existed: derive the extension from the stored file name.
  const product =
    base && record?.file && base.fileExt === undefined ? { ...base, fileExt: extOf(record.file.name) } : base;
  // Unpublished files are only visible to the admin (as a preview).
  const visible = product && (!record || record.published || isAdmin);

  const title = visible ? product?.title : undefined;
  useEffect(() => {
    if (title) document.title = `${title} · ${SITE.name}`;
  }, [title]);

  if (!hydrated) {
    return (
      <Container className="mt-3">
        <div className="frame h-72 p-4">
          <div className="skeleton h-full w-full" aria-busy="true" />
        </div>
      </Container>
    );
  }
  if (!visible || !product) {
    return (
      <Container className="mt-3 md:mt-[14px]">
        <section className="frame on-paper p-5">
          <EmptyState title="File not found">
            This file is not available in this browser.{' '}
            <Link href="/shop/" className="link">
              Browse the shop
            </Link>
            .
          </EmptyState>
        </section>
      </Container>
    );
  }
  return (
    <>
      {record && !record.published && (
        <Container className="mt-3">
          <p
            role="status"
            className="rounded-md border border-[#c9a54a] bg-[#f3e6b8] p-2 text-[12px] text-ink"
          >
            Preview: this file is unpublished and only visible to admins.
          </p>
        </Container>
      )}
      <ProductDetail product={product} related={relatedProducts(product, 4)} />
    </>
  );
}
