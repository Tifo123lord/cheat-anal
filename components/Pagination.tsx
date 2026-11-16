'use client';

import { ArrowLeft, ArrowRight } from './Icons';

interface Props {
  page: number;
  pages: number;
  onPage: (p: number) => void;
  label?: string;
}

export default function Pagination({ page, pages, onPage, label = 'Pagination' }: Props) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  const btn = 'min-w-[28px] rounded-full border px-2 py-1 text-[12px] font-bold';
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        className={`${btn} border-[#4a4833] bg-olive-dark text-ink-light disabled:opacity-40`}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <ArrowLeft size={12} />
      </button>
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Page ${n}`}
          className={`${btn} ${n === page ? 'border-leaf-dark bg-leaf text-[#16200a]' : 'border-[#4a4833] bg-olive-dark text-ink-light hover:bg-olive'}`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className={`${btn} border-[#4a4833] bg-olive-dark px-3 text-ink-light disabled:opacity-40`}
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        <span className="inline-flex items-center gap-1">
          Next <ArrowRight size={12} />
        </span>
      </button>
    </nav>
  );
}
