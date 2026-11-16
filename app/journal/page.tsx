import type { Metadata } from 'next';
import Link from 'next/link';
import { TwoColumn } from '@/components/Layout';
import ProductImage from '@/components/ProductImage';
import { authorName, posts } from '@/lib/catalog';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes from the leafpress greenhouse: craft, licensing, reviews and greener downloads.',
  alternates: { canonical: '/journal/' },
};

export default function JournalPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">Journal</h1>
        <p className="text-[12px] text-ink-muted">Notes from the greenhouse.</p>
      </div>
      <ul className="space-y-[14px]">
        {posts.map((p) => (
          <li key={p.slug}>
            <article className="card frame on-paper grid gap-3 p-[7px] sm:grid-cols-[200px_1fr]">
              <div className="inset-img overflow-hidden">
                <ProductImage product={{ images: [p.art], title: p.title }} alt="" sizes="200px" />
              </div>
              <div className="p-1">
                <p className="text-[11px] text-ink-muted">
                  {formatDate(p.date)} · {authorName(p.authorId)}
                </p>
                <h2 className="font-serif text-[16px] font-bold leading-tight">
                  <Link
                    href={`/journal/${p.slug}/`}
                    className="text-[color:var(--link-strong)] hover:underline"
                  >
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-1 text-[12.5px] text-ink">{p.excerpt}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </TwoColumn>
  );
}
