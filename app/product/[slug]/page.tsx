import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { getProductBySlug, products } from '@/lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProductBySlug(params.slug);
  if (!p) return { title: 'File not found' };
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
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
