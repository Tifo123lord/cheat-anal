import Link from 'next/link';
import { allTags, categories, topAuthors } from '@/lib/catalog';
import { asset } from '@/lib/asset';
import { compact } from '@/lib/format';
import Avatar from './Avatar';
import CreamFrame from './CreamFrame';
import { CameraIcon, CategoryIcon, ChatIcon, RssIcon, VideoIcon } from './Icons';
import NewsletterForm from './NewsletterForm';
import PromoBanner from './PromoBanner';
import SidebarWidget from './SidebarWidget';

export default function Sidebar() {
  const tags = allTags();
  const max = tags[0]?.count ?? 1;
  return (
    <CreamFrame as="aside" label="Sidebar" className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#bcb399] px-3 py-2.5 text-[10px] font-bold uppercase leading-tight text-ink">
        <a href={asset('/feed.xml')} className="flex items-center gap-1.5 hover:underline">
          <span className="rounded bg-[#e0892f] p-1 text-white">
            <RssIcon size={12} />
          </span>
          Subscribe
          <br />
          to RSS
        </a>
        <span className="flex items-center gap-1.5">
          Follow us
          <br />
          on social
          <span className="flex gap-1">
            {[
              { I: ChatIcon, l: 'Community chat' },
              { I: CameraIcon, l: 'Photo feed' },
              { I: VideoIcon, l: 'Video channel' },
            ].map(({ I, l }) => (
              <Link
                key={l}
                href="/info/contact/"
                aria-label={l}
                className="rounded bg-[#3f7fb8] p-1 text-white hover:brightness-110"
              >
                <I size={12} />
              </Link>
            ))}
          </span>
        </span>
      </div>

      <nav aria-label="Categories" className="border-b border-[#bcb399] px-3 py-2.5">
        <ul className="grid grid-cols-7 gap-1.5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.id}/`}
                title={c.name}
                aria-label={c.name}
                className="flex aspect-square items-center justify-center rounded-[3px] border border-[#9a8f6e] bg-gradient-to-b from-[#d6c79f] to-[#b9a777] text-[#4a4026] shadow-[inset_0_1px_0_rgba(255,255,255,.5)] hover:from-[#e2d6b3]"
              >
                <CategoryIcon name={c.icon} size={14} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-3 border-b border-[#bcb399] px-3 py-3">
        <PromoBanner kind="packly" />
        <PromoBanner kind="birdsong" />
        <PromoBanner kind="navkit" />
      </div>

      <SidebarWidget title="Newsletter" id="sb-news">
        <NewsletterForm />
      </SidebarWidget>

      <SidebarWidget title="Authors" id="sb-authors">
        <ol className="space-y-2">
          {topAuthors()
            .slice(0, 5)
            .map((a) => (
              <li key={a.id}>
                <Link href={`/authors/${a.id}/`} className="flex items-center gap-2 hover:underline">
                  <Avatar seed={a.avatarSeed} name={a.name} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{a.name}</span>
                  {a.sales > 0 && (
                    <span className="text-[11px] text-ink-muted">{compact(a.sales)} sales</span>
                  )}
                </Link>
              </li>
            ))}
        </ol>
      </SidebarWidget>

      {tags.length > 0 && (
        <SidebarWidget title="Tags" id="sb-tags">
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {tags.slice(0, 22).map((t) => (
              <li key={t.tag}>
                <Link
                  href={`/shop/?q=${encodeURIComponent(t.tag)}`}
                  className="text-[color:var(--link-strong)] hover:underline"
                  style={{ fontSize: `${11 + Math.round((t.count / max) * 5)}px` }}
                >
                  {t.tag}
                </Link>
              </li>
            ))}
          </ul>
        </SidebarWidget>
      )}

      <p className="px-3 pb-4 pt-3 text-center text-[11px] font-bold">
        <Link href="/sell/#advertise" className="hover:underline">
          Advertise with Cheat &amp; Anal
        </Link>
      </p>
    </CreamFrame>
  );
}
