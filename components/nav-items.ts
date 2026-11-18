export const NAV_ITEMS = [
  { href: '/', label: 'خانه' },
  { href: '/shop/', label: 'فروشگاه' },
  { href: '/category/cheats/', label: 'چیت‌ها' },
  { href: '/new-releases/', label: 'تازه‌ها' },
  { href: '/authors/', label: 'سازنده‌ها' },
  { href: '/bundles/', label: 'بسته‌ها' },
  { href: '/free-files/', label: 'فایل‌های رایگان' },
  { href: '/sell/', label: 'با ما بفروشید' },
] as const;

export const isActive = (pathname: string, href: string): boolean => {
  const p = pathname.replace(/\/+$/, '') || '/';
  const h = href.replace(/\/+$/, '') || '/';
  if (h === '/') return p === '/';
  return p === h || p.startsWith(`${h}/`);
};
