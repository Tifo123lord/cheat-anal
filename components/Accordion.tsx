'use client';

import { useId, useState } from 'react';
import { ChevronDown } from './Icons';

export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[#bcb399] rounded-md border border-[#bcb399]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-[13px] font-bold text-ink hover:bg-paper-light"
              >
                {it.q}
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            <div
              id={`${base}-p${i}`}
              role="region"
              aria-labelledby={`${base}-b${i}`}
              hidden={!isOpen}
              className="px-3 pb-3 text-[13px] text-ink"
            >
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
