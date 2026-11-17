import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import { TwoColumn } from '@/components/Layout';
import { LeafRow } from '@/components/LeafRating';
import ProductGrid from '@/components/ProductGrid';
import { NO_FILES_TITLE, authors, getAuthor, productsByAuthor } from '@/lib/catalog';
import { formatDate } from '@/lib/format';

export const dynamicParams = false;

export function generateStaticParams() {
  return authors.map((a) => ({ id: a.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const a = getAuthor(params.id);
  if (!a) return { title: 'Author not found' };
  return {
    title: a.name,
    description: a.bio,
    alternates: { canonical: `/authors/${a.id}/` },
    openGraph: { title: a.name, description: a.bio },
  };
}

export default function AuthorPage({ params }: { params: { id: string } }) {
  const author = getAuthor(params.id);
  if (!author) notFound();
  const files = productsByAuthor(author.id);
  return (
    <TwoColumn>
      <section className="frame on-paper mb-[14px] p-4" aria-labelledby="author-h">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar seed={author.avatarSeed} name={author.name} size={72} />
          <div className="min-w-0 flex-1">
            <h1 id="author-h" className="page-title">
              {author.name}
            </h1>
            <p className="text-[12px] text-ink-muted">
              {author.location} · author since {formatDate(author.joined)}
            </p>
            <p className="mt-1 text-[13px] text-ink">{author.bio}</p>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['Files', String(files.length)],
            ['Sales', author.sales.toLocaleString('en-US')],
            ['Rating', author.rating > 0 ? author.rating.toFixed(1) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-[#a49b82] bg-paper-light/60 p-2">
              <dt className="text-[11px] font-semibold uppercase text-ink-muted">{k}</dt>
              <dd className="font-display text-[18px] font-bold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {author.rating > 0 && (
          <div className="mt-2 flex justify-center">
            <LeafRow rating={author.rating} size={16} />
          </div>
        )}
      </section>
      <h2 className="brand-heading mb-2 text-[17px] text-ink-light">Files by {author.name}</h2>
      {files.length ? (
        <ProductGrid items={files} />
      ) : (
        <div className="frame on-paper" data-testid="author-empty">
          <EmptyState title={NO_FILES_TITLE}>{author.name} has no files listed right now.</EmptyState>
        </div>
      )}
    </TwoColumn>
  );
}
