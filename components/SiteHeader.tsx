'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/store/cart';
import { useCurrentUser } from '@/store/auth';
import { useHydrated } from '@/store/hydration';
import { useWishlist } from '@/store/wishlist';
import { CartIcon, CloseIcon, HeartIcon, MenuIcon, UserIcon } from './Icons';
import Logo from './Logo';
import Modal from './Modal';
import { NAV_ITEMS, isActive } from './nav-items';
import SearchBox from './SearchBox';

export default function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [drawer, setDrawer] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => s.lines.length);
  const wish = useWishlist((s) => s.ids.length);
  const user = useCurrentUser();

  return (
    <header className="site-header relative z-20">
      {/* 1. header band (130px) with the wordmark */}
      <div className="mx-auto flex h-[96px] max-w-site items-center justify-between px-3 md:h-[130px] lg:px-0">
        <div className="flex items-center gap-2 pt-3 md:pt-0">
          <button
            type="button"
            className="rounded-md border border-[#3d3b28] bg-olive-dark/80 p-2 text-ink-light md:hidden"
            aria-label="باز کردن منو"
            aria-expanded={drawer}
            aria-controls="mobile-drawer"
            onClick={() => setDrawer(true)}
          >
            <MenuIcon size={20} />
          </button>
          <div className="md:-mt-2 md:ps-6">
            <Logo />
          </div>
        </div>
        <nav
          aria-label="حساب کاربری"
          className="hidden items-center gap-3 self-start pt-3 text-[11px] text-ink-light/90 md:flex"
        >
          <Link
            href={hydrated && user ? '/account/' : '/login/'}
            className="inline-flex items-center gap-1 hover:text-white"
          >
            <UserIcon size={13} />
            {hydrated && user ? <bdi>{user.name.split(' ')[0]}</bdi> : 'ورود'}
          </Link>
          {hydrated && user?.role === 'admin' && (
            <Link
              href="/admin/"
              className="inline-flex items-center gap-1 font-bold text-[#ff8a96] hover:text-white"
            >
              مدیریت
            </Link>
          )}
          <Link
            href="/account/#wishlist"
            className="inline-flex items-center gap-1 hover:text-white"
            aria-label={`علاقه‌مندی‌ها، ${hydrated ? wish : 0} مورد`}
          >
            <HeartIcon size={13} /> {hydrated ? wish : 0}
          </Link>
          <Link
            href="/cart/"
            className="inline-flex items-center gap-1 hover:text-white"
            aria-label={`سبد خرید، ${hydrated ? count : 0} مورد`}
          >
            <CartIcon size={13} /> {hydrated ? count : 0}
          </Link>
        </nav>
        <Link
          href="/cart/"
          className="relative mt-3 rounded-md border border-[#3d3b28] bg-olive-dark/80 p-2 text-ink-light md:hidden"
          aria-label={`سبد خرید، ${hydrated ? count : 0} مورد`}
        >
          <CartIcon size={20} />
          {hydrated && count > 0 && (
            <span className="absolute -end-1.5 -top-1.5 rounded-full bg-leaf px-1.5 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* 2. olive nav bar */}
      <div className="mx-auto hidden max-w-site px-3 md:block lg:px-0">
        <nav aria-label="منوی اصلی" className="navbar flex flex-wrap items-center gap-y-1 px-2.5 py-[7px]">
          <ul className="flex flex-1 flex-wrap items-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className="nav-link block rounded-md px-[10px] py-[5px] text-[12px] hover:bg-black/20"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="w-[170px] shrink-0 py-0.5 pe-1">
            <SearchBox />
          </div>
        </nav>
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="منو" variant="drawer">
        <div id="mobile-drawer">
          <SearchBox variant="panel" onNavigate={() => setDrawer(false)} />
          <ul className="mt-3 divide-y divide-[#c2b99f]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setDrawer(false)}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className="block py-2.5 font-display text-[15px] font-bold uppercase text-ink aria-[current=page]:text-[color:var(--link-strong)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/library/" onClick={() => setDrawer(false)} className="btn-ghost">
              دانلودهای من
            </Link>
            <Link href="/dashboard/" onClick={() => setDrawer(false)} className="btn-ghost">
              داشبورد سازنده
            </Link>
            <Link href="/journal/" onClick={() => setDrawer(false)} className="btn-ghost">
              مجله
            </Link>
            {hydrated && user?.role === 'admin' && (
              <Link href="/admin/" onClick={() => setDrawer(false)} className="btn-ghost">
                پنل مدیریت
              </Link>
            )}
            <Link
              href={user ? '/account/' : '/login/'}
              onClick={() => setDrawer(false)}
              className="btn-ghost"
            >
              {user ? 'حساب کاربری' : 'ورود'}
            </Link>
          </div>
          <button type="button" className="sr-only focus:not-sr-only" onClick={() => setDrawer(false)}>
            <CloseIcon size={14} /> بستن منو
          </button>
        </div>
      </Modal>
    </header>
  );
}
