'use client';

import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import { authorName, productHref, products } from '@/lib/catalog';
import { usePublishedAdminProducts } from '@/store/admin-catalog';
import { matchesQuery } from '@/lib/filters';
import { money } from '@/lib/format';
import { SearchIcon } from './Icons';
import ProductImage from './ProductImage';

/** Search field with live suggestions (title, thumbnail, price), as an ARIA combobox. */
export default function SearchBox({
  variant = 'nav',
  onNavigate,
  autoFocus = false,
}: {
  variant?: 'nav' | 'panel';
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const adminItems = usePublishedAdminProducts();
  const results = useMemo(
    () =>
      q.trim().length < 2
        ? []
        : [...adminItems, ...products].filter((p) => matchesQuery(p, q, authorName(p.authorId))).slice(0, 6),
    [q, adminItems],
  );
  const listId = `${id}-list`;
  const showList = open && q.trim().length >= 2;

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
    router.push(href);
  };

  const submit = () => {
    if (active >= 0 && results[active]) go(productHref(results[active]));
    else if (q.trim()) go(`/shop/?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form
      role="search"
      className={`relative ${variant === 'nav' ? 'w-full' : 'w-full'}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor={`${id}-in`} className="sr-only">
        جست‌وجوی فایل‌ها
      </label>
      <input
        ref={inputRef}
        id={`${id}-in`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        data-autofocus={autoFocus || undefined}
        placeholder="جست‌وجوی فایل‌ها…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(results.length - 1, a + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(-1, a - 1));
          } else if (e.key === 'Escape') {
            setOpen(false);
            setActive(-1);
          }
        }}
        className={
          variant === 'nav'
            ? 'h-[25px] w-full rounded-full border border-[#2b2a1d] bg-[#efeadb] ps-3 pe-7 text-[12px] text-ink shadow-[inset_0_1px_3px_rgba(0,0,0,.45)] placeholder:text-[#6b6754]'
            : 'field pe-9'
        }
      />
      <button
        type="submit"
        aria-label="جست‌وجو"
        className={`absolute top-1/2 -translate-y-1/2 text-[#4a4733] ${variant === 'nav' ? 'end-2' : 'end-3'}`}
      >
        <SearchIcon size={variant === 'nav' ? 12 : 16} />
      </button>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="پیشنهادها"
          className="frame on-paper absolute end-0 top-[calc(100%+6px)] z-40 w-full min-w-[260px] overflow-hidden p-1 text-ink"
        >
          {results.length === 0 && (
            <li className="px-2 py-2 text-[12px] text-ink-muted">
              فایلی با «<bdi>{q}</bdi>» پیدا نشد.
            </li>
          )}
          {results.map((p, i) => (
            <li
              key={p.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(productHref(p));
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 ${i === active ? 'bg-paper-dark' : ''}`}
            >
              <span className="w-[52px] shrink-0 overflow-hidden rounded-sm border border-[#8f8770]">
                <ProductImage product={p} alt="" sizes="52px" />
              </span>
              <bdi className="min-w-0 flex-1 truncate text-[12px] font-semibold">{p.title}</bdi>
              <span className="shrink-0 text-[12px] font-bold">{money(p.salePrice ?? p.price)}</span>
            </li>
          ))}
          {results.length > 0 && (
            <li
              role="option"
              aria-selected={false}
              className="border-t border-[#b3aa91] px-2 pt-1 text-[11px]"
            >
              <button type="submit" className="link">
                همهٔ نتایج برای «<bdi>{q}</bdi>»
              </button>
            </li>
          )}
        </ul>
      )}
    </form>
  );
}
