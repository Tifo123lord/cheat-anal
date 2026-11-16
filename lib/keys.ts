import { hashString, seeded } from './random';

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A licence key derived from order + item so it is stable for re-display. */
export function licenseKey(orderId: string, itemId: string, license: string): string {
  const r = seeded(hashString(`${orderId}|${itemId}|${license}`));
  const group = () => Array.from({ length: 4 }, () => ALPHA[Math.floor(r() * ALPHA.length)]).join('');
  return `LP-${group()}-${group()}-${group()}-${group()}`;
}

export function orderNumber(now: number = Date.now(), entropy: number = Math.random()): string {
  const d = new Date(now);
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const tail = Math.floor(entropy * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `LP-${ymd}-${tail}`;
}
