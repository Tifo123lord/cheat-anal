'use client';

import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { getCategory } from '@/lib/catalog';
import { formatDate } from '@/lib/format';
import { useHydrated } from '@/store/hydration';
import { useStudio, type SubmissionStatus } from '@/store/studio';
import { useUI } from '@/store/ui';

const TABS: SubmissionStatus[] = ['pending', 'approved', 'rejected', 'draft'];
const LABEL: Record<SubmissionStatus, string> = {
  pending: 'در حال بررسی',
  approved: 'تأییدشده',
  rejected: 'ردشده',
  draft: 'پیش‌نویس',
};

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
        صف بررسی فایل‌های سازنده‌ها
      </h2>
      <p className="text-[12px] text-ink-muted">
        فایل‌هایی را که از داشبورد سازنده در این مرورگر ارسال شده‌اند تأیید یا رد کن.
      </p>
      <div role="group" aria-label="فیلتر بر اساس وضعیت" className="mt-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={tab === t ? 'btn' : 'btn-ghost'}
          >
            {LABEL[t]} ({hydrated ? submissions.filter((s) => s.status === t).length : 0})
          </button>
        ))}
      </div>
      {!hydrated ? (
        <div className="skeleton mt-4 h-32 w-full" aria-busy="true" />
      ) : list.length === 0 ? (
        <EmptyState title={`فایل «${LABEL[tab]}» وجود ندارد`}>
          {tab === 'pending'
            ? 'از داشبورد سازنده یک فایل ارسال کن تا برای بررسی اینجا نمایش داده شود.'
            : 'فعلاً چیزی اینجا نیست.'}
        </EmptyState>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((s) => (
            <li key={s.id} className="rounded-md border border-[#a49b82] bg-paper-light/50 p-3 text-ink">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-serif text-[15px] font-bold" dir="auto">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    <bdi>{s.author}</bdi> · {getCategory(s.category)?.name ?? '—'} · ${s.price} ·{' '}
                    {formatDate(s.createdAt)}
                  </p>
                  <p className="mt-1 text-[12px]" dir="auto">
                    {s.description || <em>بدون توضیحات</em>}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    پیش‌نمایش‌ها: <bdi>{s.previewNames.join(', ') || '—'}</bdi> · فایل:{' '}
                    <bdi>{s.fileName || '—'}</bdi> · برچسب‌ها: <bdi>{s.tags.join(', ') || '—'}</bdi>
                  </p>
                </div>
                {s.status === 'pending' && (
                  <div className="w-full space-y-2 sm:w-[220px]">
                    <label htmlFor={`note-${s.id}`} className="label">
                      یادداشت برای سازنده (اختیاری)
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
                          toast(`«${s.title}» تأیید شد`);
                        }}
                      >
                        تأیید
                      </button>
                      <button
                        type="button"
                        className="btn-ghost flex-1 !border-sale !text-[#9e2f19]"
                        onClick={() => {
                          setStatus(s.id, 'rejected', notes[s.id] || 'نیاز به اصلاح دارد');
                          toast(`«${s.title}» رد شد`);
                        }}
                      >
                        رد
                      </button>
                    </div>
                  </div>
                )}
                {s.status !== 'pending' && s.note && (
                  <p className="text-[11px] text-ink-muted">یادداشت: {s.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
