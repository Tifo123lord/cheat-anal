'use client';

import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { getCategory } from '@/lib/catalog';
import { formatDate } from '@/lib/format';
import { useHydrated } from '@/store/hydration';
import { useStudio, type SubmissionStatus } from '@/store/studio';
import { useUI } from '@/store/ui';

const TABS: SubmissionStatus[] = ['pending', 'approved', 'rejected', 'draft'];

export default function ReviewQueue() {
  const hydrated = useHydrated();
  const submissions = useStudio((s) => s.submissions);
  const setStatus = useStudio((s) => s.setStatus);
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState<SubmissionStatus>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const list = submissions.filter((s) => s.status === tab);

  return (
    <section aria-labelledby="rq-h">
      <h2 id="rq-h" className="widget-title">
        Author review queue
      </h2>
      <p className="text-[12px] text-ink-muted">
        Approve or reject files submitted from the author dashboard in this browser.
      </p>
      <div role="group" aria-label="Filter by status" className="mt-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={tab === t ? 'btn' : 'btn-ghost'}
          >
            {t[0].toUpperCase() + t.slice(1)} (
            {hydrated ? submissions.filter((s) => s.status === t).length : 0})
          </button>
        ))}
      </div>
      {!hydrated ? (
        <div className="skeleton mt-4 h-32 w-full" aria-busy="true" />
      ) : list.length === 0 ? (
        <EmptyState title={`No ${tab} files`}>
          {tab === 'pending'
            ? 'Submit a file from the author dashboard and it will appear here for review.'
            : 'Nothing here yet.'}
        </EmptyState>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((s) => (
            <li key={s.id} className="rounded-md border border-[#a49b82] bg-paper-light/50 p-3 text-ink">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-serif text-[15px] font-bold">{s.title}</h3>
                  <p className="text-[11px] text-ink-muted">
                    {s.author} · {getCategory(s.category)?.name ?? '—'} · ${s.price} ·{' '}
                    {formatDate(s.createdAt)}
                  </p>
                  <p className="mt-1 text-[12px]">{s.description || <em>No description</em>}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Previews: {s.previewNames.join(', ') || '—'} · File: {s.fileName || '—'} · Tags:{' '}
                    {s.tags.join(', ') || '—'}
                  </p>
                </div>
                {s.status === 'pending' && (
                  <div className="w-full space-y-2 sm:w-[220px]">
                    <label htmlFor={`note-${s.id}`} className="label">
                      Note to author (optional)
                    </label>
                    <input
                      id={`note-${s.id}`}
                      className="field !py-1.5"
                      value={notes[s.id] ?? ''}
                      onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn flex-1"
                        onClick={() => {
                          setStatus(s.id, 'approved', notes[s.id] || undefined);
                          toast(`Approved “${s.title}”`);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-ghost flex-1 !border-sale !text-[#9e2f19]"
                        onClick={() => {
                          setStatus(s.id, 'rejected', notes[s.id] || 'Needs changes');
                          toast(`Rejected “${s.title}”`);
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
                {s.status !== 'pending' && s.note && (
                  <p className="text-[11px] text-ink-muted">Note: {s.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
