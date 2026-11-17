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

/**
 * Sales history for an author account (Dec 2025 – Nov 2026). The store ships with no seeded files,
 * so there is no demo history: every month starts at zero.
 */
export function salesStats(): MonthStat[] {
  return MONTHS.map((label) => ({ label, sales: 0, gross: 0, fee: 0, net: 0 }));
}

export const hasSales = (stats: MonthStat[]): boolean => stats.some((s) => s.sales > 0 || s.net > 0);
