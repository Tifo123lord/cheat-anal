'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser, type User } from '@/store/auth';
import { useHydrated } from '@/store/hydration';

/**
 * Sends signed-out visitors to /login/?next=<this page> once the stores are hydrated.
 * Returns the user (null while hydrating or redirecting).
 */
export function useRequireLogin(role?: 'admin'): { user: User | null; ready: boolean; allowed: boolean } {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  useEffect(() => {
    if (!hydrated || user) return;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`/login/?next=${encodeURIComponent(pathname + search)}`);
  }, [hydrated, user, router, pathname]);
  const allowed = !!user && (!role || user.role === role);
  return { user: hydrated ? user : null, ready: hydrated && !!user, allowed };
}
