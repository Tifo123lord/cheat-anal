'use client';

import { useId, useRef, useState, type ReactNode } from 'react';

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
}

/** WAI-ARIA tabs with arrow-key navigation. */
export default function Tabs({ tabs, label }: { tabs: TabDef[]; label: string }) {
  const base = useId();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 border-b border-[#a49b82]">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') move(i + 1);
              else if (e.key === 'ArrowLeft') move(i - 1);
              else if (e.key === 'Home') move(0);
              else if (e.key === 'End') move(tabs.length - 1);
            }}
            className={`-mb-px rounded-t-md border px-3 py-1.5 text-[12px] font-bold ${i === active ? 'border-[#a49b82] border-b-paper bg-paper text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="pt-3"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
