export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/shop/', label: 'Shop' },
  { href: '/category/cheats/', label: 'Cheats' },
  { href: '/new-releases/', label: 'New Releases' },
  { href: '/authors/', label: 'Authors' },
  { href: '/bundles/', label: 'Bundles' },
  { href: '/free-files/', label: 'Free Files' },
  { href: '/sell/', label: 'Sell With Us' },
] as const;

export const isActive = (pathname: string, href: string): boolean => {
  const p = pathname.replace(/\/+$/, '') || '/';
  const h = href.replace(/\/+$/, '') || '/';
  if (h === '/') return p === '/';
  return p === h || p.startsWith(`${h}/`);
};
