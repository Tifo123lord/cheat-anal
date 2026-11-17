import type { Metadata } from 'next';
import Link from 'next/link';
import { TwoColumn } from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import { products } from '@/lib/catalog';
import { sortProducts } from '@/lib/filters';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'New releases',
  description: 'The newest digital files on Cheat & Anal, freshly reviewed and ready to download.',
  alternates: { canonical: '/new-releases/' },
};

export default function NewReleasesPage() {
  const newest = sortProducts(products, 'newest').slice(0, 12);
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">New releases</h1>
        <p className="text-[12px] text-ink-muted">
          The twelve freshest files, newest first. Latest release:{' '}
          {formatDate(newest[0]?.createdAt ?? '2026-11-01')}.{' '}
          <Link href="/shop/?sort=newest" className="link">
            Browse everything by date
          </Link>
        </p>
      </div>
      <ProductGrid items={newest} label="New releases" />
    </TwoColumn>
  );
}
