import { describe, expect, it } from 'vitest';
import { combineRating, distribution, leafFills, ratingLabel } from '@/lib/rating';

describe('rating calculation', () => {
  it('combines the seeded average with new ratings', () => {
    expect(combineRating(4, 4, [5])).toEqual({ average: 4.2, votes: 5 });
    expect(combineRating(3.5, 1, [])).toEqual({ average: 3.5, votes: 1 });
    expect(combineRating(0, 0, [4, 5])).toEqual({ average: 4.5, votes: 2 });
  });

  it('ignores out-of-range ratings and handles no votes', () => {
    expect(combineRating(4, 2, [0, 6, Number.NaN])).toEqual({ average: 4, votes: 2 });
    expect(combineRating(0, 0, [])).toEqual({ average: 0, votes: 0 });
  });

  it('fills leaves fractionally', () => {
    expect(leafFills(3.5)).toEqual([1, 1, 1, 0.5, 0]);
    expect(leafFills(0)).toEqual([0, 0, 0, 0, 0]);
    expect(leafFills(7)).toEqual([1, 1, 1, 1, 1]);
    expect(leafFills(4.2).map((n) => Math.round(n * 10) / 10)).toEqual([1, 1, 1, 1, 0.2]);
  });

  it('formats the gallery-style label', () => {
    expect(ratingLabel(3.5, 1)).toBe('امتیاز: 3.5 از 5 (1 رأی)');
    expect(ratingLabel(4.2, 37)).toBe('امتیاز: 4.2 از 5 (37 رأی)');
  });

  it('builds a 5→1 distribution', () => {
    expect(distribution([5, 5, 4, 1, 3.6])).toEqual([2, 2, 0, 0, 1]);
  });
});
