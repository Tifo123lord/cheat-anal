export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Luhn check for the mock card form. */
export function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

/** MM/YY that is this month or later. */
export function validExpiry(v: string, now: Date = new Date()): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const y = now.getFullYear();
  const mo = now.getMonth() + 1;
  return year > y || (year === y && month >= mo);
}

export const validCvc = (v: string): boolean => /^\d{3,4}$/.test(v.trim());

export type Errors<T extends string> = Partial<Record<T, string>>;

/** Only same-site, root-relative redirect targets (no //evil.com); defaults to the account page. */
export const safeNext = (n: string | null | undefined): string =>
  n && n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/\\') ? n : '/account/';
