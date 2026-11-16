'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCurrentUser } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/hydration';
import { CartIcon, SearchIcon, UserIcon } from './Icons';
import Modal from './Modal';
import SearchBox from './SearchBox';

/** Sticky bottom bar on phones: Search, Cart, Account. */
export default function MobileBar() {
  const [search, setSearch] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => s.lines.length);
  const user = useCurrentUser();
  const item = 'flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold text-ink-light';
  return (
    <>
      <nav
        aria-label="Quick actions"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-[#23221a] bg-gradient-to-b from-olive to-olive-dark pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="flex">
          <button type="button" className={item} onClick={() => setSearch(true)}>
            <SearchIcon size={18} />
            Search
          </button>
          <Link href="/cart/" className={`${item} relative`}>
            <CartIcon size={18} />
            Cart{hydrated && count > 0 ? ` (${count})` : ''}
          </Link>
          <Link href={hydrated && user ? '/account/' : '/login/'} className={item}>
            <UserIcon size={18} />
            Account
          </Link>
        </div>
      </nav>
      <Modal open={search} onClose={() => setSearch(false)} title="Search files" variant="sheet">
        <SearchBox variant="panel" onNavigate={() => setSearch(false)} autoFocus />
        <p className="mt-2 pb-24 text-[12px] text-ink-muted">
          Try “font”, “icons”, “mockup” or an author’s name.
        </p>
      </Modal>
    </>
  );
}
