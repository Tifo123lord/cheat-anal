import type { ReactNode } from 'react';

export default function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center text-ink">
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <ellipse cx="32" cy="56" rx="18" ry="4" fill="#b9b098" />
        <path
          d="M32 54 C32 44 31 36 32 26"
          stroke="#8c0a19"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M32 32 C22 32 14 25 12 15 C23 15 31 21 32 32Z" fill="#e0102a" />
        <path d="M32 27 C40 25 48 18 51 10 C40 10 33 16 32 27Z" fill="#ff5a6c" />
      </svg>
      <h2 className="mt-2 font-display text-[17px] font-bold">{title}</h2>
      {children && <div className="mt-1 max-w-[380px] text-[13px] text-ink-muted">{children}</div>}
    </div>
  );
}
