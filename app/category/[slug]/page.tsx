import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryIcon } from '@/components/Icons';
import { TwoColumn } from '@/components/Layout';
import { categories, categoryEmptyText, getCategory } from '@/lib/catalog';
import CategoryProducts from './CategoryProducts';

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCategory(params.slug);
  if (!c) return { title: 'Category not found' };
  const description = c.description ?? `Browse ${c.name.toLowerCase()} on Cheat & Anal.`;
  return {
    title: c.name,
    description,
    alternates: { canonical: `/category/${c.id}/` },
    openGraph: { title: c.name, description },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategory(params.slug);
  if (!category) notFound();
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[#9a8f6e] bg-gradient-to-b from-[#d6c79f] to-[#b9a777] text-[#4a4026] shadow-[inset_0_1px_0_rgba(255,255,255,.5)]"
          >
            <CategoryIcon name={category.icon} size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="page-title !text-[19px]">{category.name}</h1>
            {category.description && <p className="text-[12px] text-ink-muted">{category.description}</p>}
            <p className="mt-0.5 text-[12px]">
              <Link href={`/shop/?category=${category.id}`} className="link">
                Filter {category.name.toLowerCase()} in the shop
              </Link>
            </p>
          </div>
        </div>
      </div>
      <CategoryProducts categoryId={category.id} emptyTitle={categoryEmptyText(category)} />
    </TwoColumn>
  );
}
