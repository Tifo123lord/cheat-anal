'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { Container } from '@/components/Layout';
import SalesChart from '@/components/SalesChart';
import { getCategory } from '@/lib/catalog';
import { formatDate, money2 } from '@/lib/format';
import { MIN_PAYOUT, hasSales, salesStats } from '@/lib/stats';
import { useCurrentUser } from '@/store/auth';
import { useHydrated } from '@/store/hydration';
import { useStudio, type Submission } from '@/store/studio';
import { useUI } from '@/store/ui';
import UploadForm from './UploadForm';

const STATUS_STYLE: Record<Submission['status'], string> = {
  draft: 'bg-[#c6bda5] text-ink',
  pending: 'bg-[#e0b040] text-ink',
  approved: 'bg-leaf text-white',
  rejected: 'bg-sale text-white',
};

export default function DashboardView() {
  const id = useId();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const submissions = useStudio((s) => s.submissions);
  const payouts = useStudio((s) => s.payouts);
  const remove = useStudio((s) => s.remove);
  const requestPayout = useStudio((s) => s.requestPayout);
  const toast = useUI((s) => s.toast);
  const [editing, setEditing] = useState<Submission | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank transfer');
  const [payErr, setPayErr] = useState('');

  if (!hydrated) {
    return (
      <Container className="mt-3">
        <div className="frame h-96 p-4">
          <div className="skeleton h-full w-full" aria-busy="true" />
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-3 md:mt-[14px]">
        <div className="frame on-paper mx-auto max-w-[560px] p-6 text-center">
          <h1 className="page-title">Author dashboard</h1>
          <p className="mt-2 text-[13px] text-ink">
            Sign in to upload files, follow your sales and request payouts.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/login/?next=/dashboard/" className="btn">
              Sign in
            </Link>
            <Link href="/register/" className="btn-ghost">
              Create an account
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const mine = submissions.filter((s) => s.author === user.email);
  const stats = salesStats();
  const sold = hasSales(stats);
  const chart = stats.map((s) => ({ label: s.label, sales: s.sales, earnings: s.net }));
  const totalNet = stats.reduce((t, s) => t + s.net, 0);
  const totalSales = stats.reduce((t, s) => t + s.sales, 0);
  const paid = payouts.reduce((t, p) => t + p.amount, 0);
  const available = Math.max(0, Math.round((totalNet * 0.18 - paid) * 100) / 100);

  const requestPay = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(amount);
    if (!Number.isFinite(a) || a < MIN_PAYOUT) return setPayErr(`The minimum payout is $${MIN_PAYOUT}.`);
    if (a > available) return setPayErr(`You can withdraw up to ${money2(available)}.`);
    setPayErr('');
    requestPayout({
      id: `po-${Date.now()}`,
      amount: Math.round(a * 100) / 100,
      method,
      status: 'requested',
      createdAt: new Date().toISOString(),
    });
    setAmount('');
    toast('Payout requested. It usually arrives in 3–5 working days.');
  };

  const tiles = [
    ['Units sold (12 mo)', totalSales.toLocaleString('en-US')],
    ['Net earnings', money2(totalNet)],
    ['Available balance', money2(available)],
    ['Files in review', String(mine.filter((s) => s.status === 'pending').length)],
  ];

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="frame on-paper p-3 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="page-title">Author dashboard</h1>
            <p className="text-[12px] text-ink-muted">Welcome back, {user.name}.</p>
          </div>
          {user.role === 'admin' ? (
            <Link href="/admin/" className="link text-[12px]">
              Open admin panel
            </Link>
          ) : (
            <span className="text-[11px] text-ink-muted">
              Submissions are reviewed by the Cheat &amp; Anal admin.
            </span>
          )}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {tiles.map(([k, v]) => (
            <li key={k} className="rounded-md border border-[#a49b82] bg-paper-light/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{k}</p>
              <p className="font-display text-[20px] font-bold text-ink">{v}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby={`${id}-chart`}>
            <h2 id={`${id}-chart`} className="widget-title mb-2">
              Sales statistics
            </h2>
            {sold ? (
              <SalesChart data={chart} />
            ) : (
              <div className="rounded-md border border-[#a49b82] bg-paper-light/60" data-testid="sales-empty">
                <EmptyState title="No sales yet">Your monthly sales and earnings appear here.</EmptyState>
              </div>
            )}
          </section>
          <section aria-labelledby={`${id}-pay`}>
            <h2 id={`${id}-pay`} className="widget-title mb-2">
              Request a payout
            </h2>
            <form noValidate onSubmit={requestPay} className="space-y-2">
              <div>
                <label htmlFor={`${id}-amt`} className="label">
                  Amount (available {money2(available)})
                </label>
                <input
                  id={`${id}-amt`}
                  className="field"
                  type="number"
                  min={MIN_PAYOUT}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-invalid={Boolean(payErr)}
                  aria-describedby={payErr ? `${id}-amt-err` : undefined}
                />
                {payErr && (
                  <p id={`${id}-amt-err`} className="error-text">
                    {payErr}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${id}-method`} className="label">
                  Method
                </label>
                <select
                  id={`${id}-method`}
                  className="field"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option>Bank transfer</option>
                  <option>Digital wallet</option>
                </select>
              </div>
              <button type="submit" className="btn" disabled={available < MIN_PAYOUT}>
                Request payout
              </button>
            </form>
            {payouts.length > 0 && (
              <ul className="mt-3 space-y-1 text-[12px] text-ink">
                {payouts.map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-[#c9c0a6] py-1">
                    <span>
                      {formatDate(p.createdAt)} · {p.method}
                    </span>
                    <span className="font-semibold">
                      {money2(p.amount)} <span className="text-ink-muted">({p.status})</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-5" aria-labelledby={`${id}-earn`}>
          <h2 id={`${id}-earn`} className="widget-title mb-2">
            Earnings
          </h2>
          {sold ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[12px] text-ink">
                <thead>
                  <tr className="border-b border-[#a49b82] text-left">
                    <th scope="col" className="py-1">
                      Month
                    </th>
                    <th scope="col" className="py-1 text-right">
                      Units
                    </th>
                    <th scope="col" className="py-1 text-right">
                      Gross
                    </th>
                    <th scope="col" className="py-1 text-right">
                      Fee (30%)
                    </th>
                    <th scope="col" className="py-1 text-right">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...stats].reverse().map((s) => (
                    <tr key={s.label} className="border-b border-[#c9c0a6]">
                      <th scope="row" className="py-1 text-left font-semibold">
                        {s.label}
                      </th>
                      <td className="py-1 text-right">{s.sales}</td>
                      <td className="py-1 text-right">{money2(s.gross)}</td>
                      <td className="py-1 text-right">−{money2(s.fee)}</td>
                      <td className="py-1 text-right font-semibold">{money2(s.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted">No earnings yet. Months with sales are listed here.</p>
          )}
        </section>

        <section className="mt-6" aria-labelledby={`${id}-up`}>
          <h2 id={`${id}-up`} className="widget-title mb-2">
            {editing ? `Edit “${editing.title}”` : 'Upload a new file'}
          </h2>
          <UploadForm author={user.email} editing={editing} onDone={() => setEditing(null)} />
        </section>

        <section className="mt-6" aria-labelledby={`${id}-subs`}>
          <h2 id={`${id}-subs`} className="widget-title mb-2">
            Your submissions
          </h2>
          {mine.length === 0 ? (
            <p className="text-[12px] text-ink-muted">
              No uploads yet. Your drafts and submissions will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-[#c9c0a6] rounded-md border border-[#a49b82]">
              {mine.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 text-[12px] text-ink"
                >
                  <div className="min-w-0">
                    <p className="font-bold">{s.title}</p>
                    <p className="text-ink-muted">
                      {getCategory(s.category)?.name ?? 'No category'} · ${s.price} ·{' '}
                      {formatDate(s.createdAt)}
                      {s.note ? ` · Reviewer: ${s.note}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[s.status]}`}
                    >
                      {s.status}
                    </span>
                    <button type="button" className="link" onClick={() => setEditing(s)}>
                      Edit
                    </button>
                    <button type="button" className="link" onClick={() => remove(s.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Container>
  );
}
