import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import { Container } from '@/components/Layout';
import ProductDetail from '@/components/ProductDetail';
import { PLACEHOLDER_SLUG, getProductBySlug, productSlugs } from '@/lib/catalog';

export const dynamicParams = false;

/**
 * The store ships with no seeded files, but static export needs at least one param here, so
 * `productSlugs()` falls back to a placeholder page. Admin uploads live at /product/view/?id=…
 */
export function generateStaticParams() {
  return productSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProductBySlug(params.slug);
  if (!p) return { title: 'File not found', robots: { index: false, follow: true } };
  const description = p.description.split('. ')[0] + '.';
  return {
    title: p.title,
    description,
    alternates: { canonical: `/product/${p.slug}/` },
    openGraph: { title: p.title, description, url: `/product/${p.slug}/`, type: 'website' },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (product) return <ProductDetail product={product} />;
  if (params.slug !== PLACEHOLDER_SLUG) notFound();
  return (
    <Container className="mt-3 md:mt-[14px]">
      <section className="frame on-paper p-5" data-testid="product-unavailable">
        <EmptyState title="File not found">
          This file is not listed any more. Files added by the admin open from the{' '}
          <Link href="/shop/" className="link">
            shop
          </Link>{' '}
          or the{' '}
          <Link href="/admin/" className="link">
            admin panel
          </Link>
          .
        </EmptyState>
      </section>
    </Container>
  );
}
