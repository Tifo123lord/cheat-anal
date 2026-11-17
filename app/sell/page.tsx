import type { Metadata } from 'next';
import Link from 'next/link';
import { TwoColumn } from '@/components/Layout';

export const metadata: Metadata = {
  title: 'Sell with us',
  description:
    'Become a Cheat & Anal author: keep 70% of every sale, get paid monthly, and reach buyers who care about craft.',
  alternates: { canonical: '/sell/' },
};

const STEPS = [
  ['Create your account', 'Sign up in a minute and tell us a little about your work.'],
  [
    'Upload your first file',
    'Add previews, a description, tags and the downloadable file (any type) from your dashboard.',
  ],
  ['We review it', 'A real person checks every file within one working day and sends friendly notes.'],
  ['Get paid', 'Keep 70% of every sale. Request a payout once your balance reaches $50.'],
];

export default function SellPage() {
  return (
    <TwoColumn>
      <article className="frame on-paper p-4 sm:p-6">
        <h1 className="page-title">Sell with us</h1>
        <p className="mt-1 text-[14px] text-ink">
          Cheat &amp; Anal is a small, friendly marketplace for people who make careful digital things. Grow
          an audience that values quality over quantity.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rounded-md border border-[#a49b82] bg-paper-light/60 p-3">
              <p className="font-display text-[13px] font-bold text-[color:var(--link-strong)]">
                Step {i + 1}
              </p>
              <h2 className="font-serif text-[15px] font-bold text-ink">{t}</h2>
              <p className="text-[12px] text-ink">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/register/" className="btn">
            Become an author
          </Link>
          <Link href="/dashboard/" className="btn-olive">
            Go to author dashboard
          </Link>
        </div>
        <section
          id="advertise"
          className="mt-6 rounded-md border border-[#a49b82] p-3"
          aria-labelledby="adv-h"
        >
          <h2 id="adv-h" className="font-display text-[16px] font-bold text-ink">
            Advertise with Cheat &amp; Anal
          </h2>
          <p className="text-[13px] text-ink">
            Sidebar placements reach designers and developers on every page. House ads only in this demo:
            write to us through the{' '}
            <Link href="/info/contact/" className="link">
              contact page
            </Link>
            .
          </p>
        </section>
      </article>
    </TwoColumn>
  );
}
