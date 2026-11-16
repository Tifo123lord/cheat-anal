import { hashString, seeded } from './random';

export const AUTHOR_FEE = 0.3;
export const MIN_PAYOUT = 50;

export interface MonthStat {
  label: string;
  sales: number;
  gross: number;
  fee: number;
  net: number;
}

const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

/** Deterministic demo sales history for an author account (Dec 2025 – Nov 2026). */
export function demoStats(seedKey: string): MonthStat[] {
  const r = seeded(hashString(seedKey));
  let base = 20 + r() * 30;
  return MONTHS.map((label) => {
    base = Math.max(6, base + (r() - 0.35) * 14);
    const sales = Math.round(base);
    const gross = Math.round(sales * (14 + r() * 18) * 100) / 100;
    const fee = Math.round(gross * AUTHOR_FEE * 100) / 100;
    return { label, sales, gross, fee, net: Math.round((gross - fee) * 100) / 100 };
  });
}
