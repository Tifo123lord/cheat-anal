export interface RatingSummary {
  average: number;
  votes: number;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Combines the seeded average with ratings submitted in this browser. */
export function combineRating(baseAverage: number, baseVotes: number, extra: number[]): RatingSummary {
  const valid = extra.filter((r) => Number.isFinite(r) && r >= 1 && r <= 5);
  const votes = baseVotes + valid.length;
  if (votes === 0) return { average: 0, votes: 0 };
  const sum = baseAverage * baseVotes + valid.reduce((t, r) => t + r, 0);
  return { average: round1(sum / votes), votes };
}

/** Fill fraction (0..1) of each of the five leaves for a rating. */
export function leafFills(rating: number, count = 5): number[] {
  const r = Math.max(0, Math.min(count, rating));
  return Array.from({ length: count }, (_, i) => Math.max(0, Math.min(1, r - i)));
}

export function ratingLabel(average: number, votes: number): string {
  return `امتیاز: ${average.toFixed(1)} از 5 (${votes} رأی)`;
}

/** Counts per star (5..1) for a distribution bar. */
export function distribution(ratings: number[]): number[] {
  const d = [0, 0, 0, 0, 0];
  ratings.forEach((r) => {
    const i = Math.min(5, Math.max(1, Math.round(r)));
    d[5 - i] += 1;
  });
  return d;
}
