import Link from 'next/link';
import { asset } from '@/lib/asset';
import { BankIcon, CameraIcon, CardIcon, ChatIcon, CoinIcon, RssIcon, VideoIcon, WalletIcon } from './Icons';
import Logo from './Logo';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'leafpress',
    links: [
      { href: '/info/about/', label: 'About' },
      { href: '/journal/', label: 'Journal' },
      { href: '/info/contact/', label: 'Contact' },
    ],
  },
  {
    title: 'Buying',
    links: [
      { href: '/info/licenses/', label: 'Licenses' },
      { href: '/info/refunds/', label: 'Refunds' },
      { href: '/info/help/', label: 'Help Center' },
    ],
  },
  {
    title: 'Selling',
    links: [
      { href: '/sell/', label: 'Become an Author' },
      { href: '/dashboard/', label: 'Author dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/info/terms/', label: 'Terms' },
      { href: '/info/privacy/', label: 'Privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-10 border-t border-[#24231a] bg-gradient-to-b from-[#16150f] to-[#0b0b0f] pb-20 text-ink-light md:pb-0">
      <div className="mx-auto grid max-w-site gap-6 px-3 py-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:px-0">
        <div>
          <Logo small />
          <p className="mt-2 text-[12px] text-[#c9c4b2]">Digital files, grown with care.</p>
          <ul className="mt-3 flex gap-2" aria-label="Social">
            {[
              { I: RssIcon, l: 'RSS feed', h: '/feed.xml' },
              { I: ChatIcon, l: 'Community chat', h: '/info/contact/' },
              { I: CameraIcon, l: 'Photo feed', h: '/info/contact/' },
              { I: VideoIcon, l: 'Video channel', h: '/info/contact/' },
            ].map(({ I, l, h }) => (
              <li key={l}>
                <a
                  href={asset(h)}
                  aria-label={l}
                  className="block rounded-full border border-[#4a4833] p-2 text-[#d9d4c2] hover:bg-olive"
                >
                  <I size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-2 font-display text-[13px] font-bold uppercase tracking-wide text-[#a9c35c]">
              {c.title}
            </h2>
            <ul className="space-y-1.5 text-[12px]">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#d9d4c2] hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[#24231a]">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-3 px-3 py-4 text-[11px] text-[#b8b3a1] lg:px-0">
          <p>© 2026 leafpress. All rights reserved.</p>
          <ul className="flex items-center gap-2" aria-label="Accepted payment methods">
            {[
              { I: CardIcon, l: 'Credit card' },
              { I: CardIcon, l: 'Debit card' },
              { I: WalletIcon, l: 'Digital wallet' },
              { I: BankIcon, l: 'Bank transfer' },
              { I: CoinIcon, l: 'Gift credit' },
            ].map(({ I, l }) => (
              <li
                key={l}
                title={l}
                className="rounded border border-[#4a4833] bg-[#1d1c15] px-2 py-1 text-[#d9d4c2]"
              >
                <I size={16} />
                <span className="sr-only">{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
