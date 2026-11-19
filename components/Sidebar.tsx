import Link from 'next/link';
import { categories, tagCloud, topAuthors } from '@/lib/catalog';
import { asset } from '@/lib/asset';
import { compact } from '@/lib/format';
import Avatar from './Avatar';
import CreamFrame from './CreamFrame';
import { CameraIcon, CategoryIcon, ChatIcon, RssIcon, VideoIcon } from './Icons';
import NewsletterForm from './NewsletterForm';
import LatestUpdates from './LatestUpdates';
import SidebarWidget from './SidebarWidget';

export default function Sidebar({ updates = true }: { updates?: boolean }) {
  const tags = tagCloud().slice(0, 34);
  const max = Math.max(1, ...tags.map((t) => t.count));
  return (
    <CreamFrame as="aside" label="ستون کناری" className="glass-side overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#bcb399] px-3 py-2.5 text-[10px] font-bold uppercase leading-tight text-ink">
        <a href={asset('/feed.xml')} className="flex items-center gap-1.5 hover:underline">
          <span className="rounded bg-[#e0892f] p-1 text-white">
            <RssIcon size={12} />
          </span>
          اشتراک
          <br />
          RSS
        </a>
        <span className="flex items-center gap-1.5">
          ما را دنبال
          <br />
          کنید
          <span className="flex gap-1">
            {[
              { I: ChatIcon, l: 'گفت‌وگوی جامعه' },
              { I: CameraIcon, l: 'صفحهٔ عکس' },
              { I: VideoIcon, l: 'کانال ویدیو' },
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

      <nav aria-label="دسته‌بندی‌ها" className="border-b border-[#bcb399] px-3 py-2.5">
        <ul className="grid grid-cols-7 gap-1.5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.id}/`}
                title={c.name}
                aria-label={c.name}
                className="glass-tile flex aspect-square items-center justify-center rounded-[5px]"
              >
                <CategoryIcon name={c.icon} size={14} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {updates && (
        <SidebarWidget title="آخرین به‌روزرسانی‌ها" id="sb-updates">
          <LatestUpdates compact />
        </SidebarWidget>
      )}

      <SidebarWidget title="خبرنامه" id="sb-news">
        <NewsletterForm />
      </SidebarWidget>

      <SidebarWidget title="سازنده‌ها" id="sb-authors">
        <ol className="space-y-2">
          {topAuthors()
            .slice(0, 5)
            .map((a) => (
              <li key={a.id}>
                <Link href={`/authors/${a.id}/`} className="flex items-center gap-2 hover:underline">
                  <Avatar seed={a.avatarSeed} name={a.name} size={26} />
                  <bdi className="min-w-0 flex-1 truncate text-[12px] font-semibold">{a.name}</bdi>
                  {a.sales > 0 && <span className="text-[11px] text-ink-muted">{compact(a.sales)} فروش</span>}
                </Link>
              </li>
            ))}
        </ol>
      </SidebarWidget>

      <SidebarWidget title="برچسب‌ها و بازی‌ها" id="sb-tags">
        <ul className="flex flex-wrap gap-x-2 gap-y-1" dir="ltr">
          {tags.map((t) => (
            <li key={`${t.game ?? 'tag'}-${t.tag}`}>
              <Link
                href={t.href}
                className="text-[color:var(--link-strong)] hover:underline"
                style={{ fontSize: `${11 + Math.round((t.count / max) * 5)}px` }}
                data-game={t.game}
              >
                {t.tag}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarWidget>
    </CreamFrame>
  );
}
