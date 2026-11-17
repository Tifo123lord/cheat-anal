import { create } from 'zustand';
import { must, sb } from '@/lib/supabase';
import type { Review } from '@/lib/types';

interface ReviewState {
  reviews: Review[];
  load: () => Promise<void>;
  addReview: (r: Review) => Promise<void>;
}

/** Ratings and reviews from every visitor, stored on the server. */
export const useReviews = create<ReviewState>()((set) => ({
  reviews: [],
  load: async () => {
    const rows = must(
      await sb().from('reviews').select('data').order('created_at', { ascending: false }).limit(1000),
    ) as { data: Review }[];
    set({ reviews: rows.map((r) => r.data) });
  },
  addReview: async (r) => {
    must(await sb().from('reviews').insert({ id: r.id, product_id: r.productId, data: r }));
    set((s) => ({ reviews: [r, ...s.reviews] }));
  },
}));

export const ratingsFor = (reviews: Review[], productId: string): number[] =>
  reviews.filter((r) => r.productId === productId).map((r) => r.rating);
