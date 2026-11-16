import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review } from '@/lib/types';
import { browserStorage } from './storage';

interface ReviewState {
  reviews: Review[];
  addReview: (r: Review) => void;
}

/** Ratings and reviews submitted in this browser; combined with seed data by lib/rating.ts. */
export const useReviews = create<ReviewState>()(
  persist(
    (set) => ({
      reviews: [],
      addReview: (r) => set((s) => ({ reviews: [r, ...s.reviews] })),
    }),
    { name: 'leafpress-reviews', storage: browserStorage, skipHydration: true },
  ),
);

export const ratingsFor = (reviews: Review[], productId: string): number[] =>
  reviews.filter((r) => r.productId === productId).map((r) => r.rating);
