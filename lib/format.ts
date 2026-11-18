export const money = (n: number): string => (n === 0 ? 'رایگان' : `$${n.toFixed(2).replace(/\.00$/, '')}`);

/** Always shows cents, for totals and invoices. */
export const money2 = (n: number): string => `$${n.toFixed(2)}`;

export const compact = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);

export const formatDate = (iso: string): string => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

/** Count + noun. Persian keeps the noun singular after a number («۳ فایل»), so `many` is optional. */
export const plural = (n: number, one: string, many = one): string => `${n} ${n === 1 ? one : many}`;
