'use client';

import { useUI } from '@/store/ui';

export default function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  return (
    <div
      className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex w-[calc(100%-24px)] max-w-[360px] -translate-x-1/2 flex-col gap-2 md:bottom-6"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="fade-in pointer-events-auto rounded-full border border-[#23221a] bg-olive-dark px-4 py-2 text-start text-[12px] font-semibold text-ink-light shadow-lg"
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}
