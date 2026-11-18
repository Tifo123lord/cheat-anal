import type { Metadata } from 'next';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { TwoColumn } from '@/components/Layout';
import { LeafRow } from '@/components/LeafRating';
import { productsByAuthor, topAuthors } from '@/lib/catalog';
import { compact, plural } from '@/lib/format';

export const metadata: Metadata = {
  title: 'سازنده‌ها',
  description: 'با استودیوها و طراحان مستقلی که فایل‌های Cheat & Anal را می‌سازند آشنا شو.',
  alternates: { canonical: '/authors/' },
};

export default function AuthorsPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">سازنده‌ها</h1>
        <p className="text-[12px] text-ink-muted">
          استودیوها و طراحانی که پشت Cheat &amp; Anal هستند. هر سازنده پیش از انتشار اولین فایلش بررسی می‌شود.
        </p>
      </div>
      <ol className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {topAuthors().map((a, i) => (
          <li key={a.id} className="card frame on-paper p-3">
            <div className="flex items-center gap-3">
              <Avatar seed={a.avatarSeed} name={a.name} size={46} />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-ink-muted">#{i + 1}</p>
                <h2 className="truncate font-serif text-[15px] font-bold">
                  <Link
                    href={`/authors/${a.id}/`}
                    className="text-[color:var(--link-strong)] hover:underline"
                  >
                    <bdi>{a.name}</bdi>
                  </Link>
                </h2>
                <p className="text-[11px] text-ink-muted" dir="auto">
                  {a.location}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-ink" dir="auto">
              {a.bio}
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-[#c2b99f] pt-1.5 text-[11px] text-ink-muted">
              <span>
                {plural(productsByAuthor(a.id).length, 'فایل')}
                {a.sales > 0 ? ` · ${compact(a.sales)} فروش` : ''}
              </span>
              {a.rating > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <LeafRow rating={a.rating} size={12} /> {a.rating.toFixed(1)}
                </span>
              ) : (
                <span>هنوز امتیازی ندارد</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </TwoColumn>
  );
}
