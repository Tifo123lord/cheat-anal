import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { browserStorage } from './storage';

export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Submission {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  previewNames: string[];
  fileName: string;
  status: SubmissionStatus;
  author: string;
  createdAt: string;
  note?: string;
}

export interface Payout {
  id: string;
  amount: number;
  method: string;
  status: 'requested' | 'paid';
  createdAt: string;
}

interface StudioState {
  submissions: Submission[];
  payouts: Payout[];
  save: (s: Submission) => void;
  setStatus: (id: string, status: SubmissionStatus, note?: string) => void;
  remove: (id: string) => void;
  requestPayout: (p: Payout) => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      submissions: [],
      payouts: [],
      save: (sub) =>
        set((s) => ({
          submissions: s.submissions.some((x) => x.id === sub.id)
            ? s.submissions.map((x) => (x.id === sub.id ? sub : x))
            : [sub, ...s.submissions],
        })),
      setStatus: (id, status, note) =>
        set((s) => ({ submissions: s.submissions.map((x) => (x.id === id ? { ...x, status, note } : x)) })),
      remove: (id) => set((s) => ({ submissions: s.submissions.filter((x) => x.id !== id) })),
      requestPayout: (p) => set((s) => ({ payouts: [p, ...s.payouts] })),
    }),
    { name: 'leafpress-studio', storage: browserStorage, skipHydration: true },
  ),
);
