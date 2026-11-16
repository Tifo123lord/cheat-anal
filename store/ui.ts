import { create } from 'zustand';

interface Toast {
  id: number;
  text: string;
}

interface UIState {
  quickViewId: string | null;
  toasts: Toast[];
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
  toast: (text: string) => void;
  dismiss: (id: number) => void;
}

let n = 0;

export const useUI = create<UIState>()((set) => ({
  quickViewId: null,
  toasts: [],
  openQuickView: (quickViewId) => set({ quickViewId }),
  closeQuickView: () => set({ quickViewId: null }),
  toast: (text) => {
    n += 1;
    const id = n;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text }] }));
    if (typeof window !== 'undefined')
      window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
