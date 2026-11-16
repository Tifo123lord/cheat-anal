import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaperPage } from '@/components/Layout';
import { INFO_PAGES } from '@/lib/pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return INFO_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = INFO_PAGES.find((x) => x.slug === params.slug);
  return p
    ? { title: p.title, description: p.description, alternates: { canonical: `/info/${p.slug}/` } }
    : { title: 'Not found' };
}

export default function InfoPage({ params }: { params: { slug: string } }) {
  const page = INFO_PAGES.find((x) => x.slug === params.slug);
  if (!page) notFound();
  return (
    <PaperPage title={page.title} intro={page.description}>
      <div className="max-w-[640px] space-y-4">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-[16px] font-bold text-ink">{s.heading}</h2>
            <p className="text-[14px] leading-relaxed text-ink">{s.body}</p>
          </section>
        ))}
      </div>
    </PaperPage>
  );
}
