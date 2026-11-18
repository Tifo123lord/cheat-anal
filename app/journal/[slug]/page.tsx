import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TwoColumn } from '@/components/Layout';
import ProductImage from '@/components/ProductImage';
import { authorName, getPost, posts } from '@/lib/catalog';
import { formatDate } from '@/lib/format';

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPost(params.slug);
  if (!p) return { title: 'مطلب پیدا نشد' };
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/journal/${p.slug}/` },
    openGraph: { type: 'article', title: p.title, description: p.excerpt, publishedTime: p.date },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  return (
    <TwoColumn>
      <article className="frame on-paper p-4 sm:p-6">
        <p className="text-[12px] text-ink-muted">
          <Link href="/journal/" className="link">
            مجله
          </Link>{' '}
          · {formatDate(post.date)} · از{' '}
          <Link href={`/authors/${post.authorId}/`} className="link">
            <bdi>{authorName(post.authorId)}</bdi>
          </Link>
        </p>
        <h1 className="product-title mt-1 font-serif text-[24px] font-bold leading-tight text-ink" dir="auto">
          {post.title}
        </h1>
        <div className="inset-img my-4 overflow-hidden">
          <ProductImage
            product={{ images: [post.art], title: post.title }}
            alt=""
            priority
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
        <div className="prose-paper text-ink" dir="auto">
          {post.body.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
      </article>
    </TwoColumn>
  );
}
