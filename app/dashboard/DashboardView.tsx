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

const STATUS_LABEL: Record<Submission['status'], string> = {
  draft: 'پیش‌نویس',
  pending: 'در حال بررسی',
  approved: 'تأییدشده',
  rejected: 'ردشده',
};

/** Payout methods are stored by their English key; shown in Persian. */
const METHOD_LABEL: Record<string, string> = {
  'Bank transfer': 'انتقال بانکی',
  'Digital wallet': 'کیف پول دیجیتال',
};
const PAYOUT_STATUS_LABEL: Record<string, string> = {
  requested: 'درخواست‌شده',
  paid: 'پرداخت‌شده',
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
          <h1 className="page-title">داشبورد سازنده</h1>
          <p className="mt-2 text-[13px] text-ink">
            برای آپلود فایل، دنبال کردن فروش‌ها و درخواست تسویه وارد حسابت شو.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/login/?next=/dashboard/" className="btn">
              ورود
            </Link>
            <Link href="/register/" className="btn-ghost">
              ساخت حساب کاربری
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
    if (!Number.isFinite(a) || a < MIN_PAYOUT) return setPayErr(`حداقل مبلغ تسویه $${MIN_PAYOUT} است.`);
    if (a > available) return setPayErr(`حداکثر می‌توانی ${money2(available)} برداشت کنی.`);
    setPayErr('');
    requestPayout({
      id: `po-${Date.now()}`,
      amount: Math.round(a * 100) / 100,
      method,
      status: 'requested',
      createdAt: new Date().toISOString(),
    });
    setAmount('');
    toast('درخواست تسویه ثبت شد. معمولاً ظرف ۳ تا ۵ روز کاری واریز می‌شود.');
  };

  const tiles = [
    ['فروش (۱۲ ماه)', totalSales.toLocaleString('en-US')],
    ['درآمد خالص', money2(totalNet)],
    ['موجودی قابل برداشت', money2(available)],
    ['فایل‌های در حال بررسی', String(mine.filter((s) => s.status === 'pending').length)],
  ];

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="frame on-paper p-3 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="page-title">داشبورد سازنده</h1>
            <p className="text-[12px] text-ink-muted">
              خوش برگشتی، <bdi>{user.name}</bdi>.
            </p>
          </div>
          {user.role === 'admin' ? (
            <Link href="/admin/" className="link text-[12px]">
              باز کردن پنل مدیریت
            </Link>
          ) : (
            <span className="text-[11px] text-ink-muted">
              فایل‌های ارسالی را مدیر Cheat &amp; Anal بررسی می‌کند.
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
              آمار فروش
            </h2>
            {sold ? (
              <SalesChart data={chart} />
            ) : (
              <div className="rounded-md border border-[#a49b82] bg-paper-light/60" data-testid="sales-empty">
                <EmptyState title="هنوز فروشی نداشته‌ای">
                  فروش و درآمد ماهانه‌ات اینجا نمایش داده می‌شود.
                </EmptyState>
              </div>
            )}
          </section>
          <section aria-labelledby={`${id}-pay`}>
            <h2 id={`${id}-pay`} className="widget-title mb-2">
              درخواست تسویه
            </h2>
            <form noValidate onSubmit={requestPay} className="space-y-2">
              <div>
                <label htmlFor={`${id}-amt`} className="label">
                  مبلغ (قابل برداشت: {money2(available)})
                </label>
                <input
                  id={`${id}-amt`}
                  className="field"
                  type="number"
                  min={MIN_PAYOUT}
                  step="0.01"
                  dir="ltr"
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
                  روش دریافت
                </label>
                <select
                  id={`${id}-method`}
                  className="field"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="Bank transfer">انتقال بانکی</option>
                  <option value="Digital wallet">کیف پول دیجیتال</option>
                </select>
              </div>
              <button type="submit" className="btn" disabled={available < MIN_PAYOUT}>
                ثبت درخواست تسویه
              </button>
            </form>
            {payouts.length > 0 && (
              <ul className="mt-3 space-y-1 text-[12px] text-ink">
                {payouts.map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-[#c9c0a6] py-1">
                    <span>
                      {formatDate(p.createdAt)} · {METHOD_LABEL[p.method] ?? p.method}
                    </span>
                    <span className="font-semibold">
                      {money2(p.amount)}{' '}
                      <span className="text-ink-muted">({PAYOUT_STATUS_LABEL[p.status] ?? p.status})</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-5" aria-labelledby={`${id}-earn`}>
          <h2 id={`${id}-earn`} className="widget-title mb-2">
            درآمد
          </h2>
          {sold ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[12px] text-ink">
                <thead>
                  <tr className="border-b border-[#a49b82] text-start">
                    <th scope="col" className="py-1">
                      ماه
                    </th>
                    <th scope="col" className="py-1 text-end">
                      تعداد
                    </th>
                    <th scope="col" className="py-1 text-end">
                      ناخالص
                    </th>
                    <th scope="col" className="py-1 text-end">
                      کارمزد (۳۰٪)
                    </th>
                    <th scope="col" className="py-1 text-end">
                      خالص
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...stats].reverse().map((s) => (
                    <tr key={s.label} className="border-b border-[#c9c0a6]">
                      <th scope="row" className="py-1 text-start font-semibold">
                        {s.label}
                      </th>
                      <td className="py-1 text-end">{s.sales}</td>
                      <td className="py-1 text-end">{money2(s.gross)}</td>
                      <td className="py-1 text-end">−{money2(s.fee)}</td>
                      <td className="py-1 text-end font-semibold">{money2(s.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[12px] text-ink-muted">
              هنوز درآمدی نداری. ماه‌هایی که فروش داشته باشند اینجا فهرست می‌شوند.
            </p>
          )}
        </section>

        <section className="mt-6" aria-labelledby={`${id}-up`}>
          <h2 id={`${id}-up`} className="widget-title mb-2">
            {editing ? `ویرایش «${editing.title}»` : 'آپلود فایل جدید'}
          </h2>
          <UploadForm author={user.email} editing={editing} onDone={() => setEditing(null)} />
        </section>

        <section className="mt-6" aria-labelledby={`${id}-subs`}>
          <h2 id={`${id}-subs`} className="widget-title mb-2">
            فایل‌های ارسالی تو
          </h2>
          {mine.length === 0 ? (
            <p className="text-[12px] text-ink-muted">
              هنوز چیزی آپلود نکرده‌ای. پیش‌نویس‌ها و فایل‌های ارسالی‌ات اینجا نمایش داده می‌شوند.
            </p>
          ) : (
            <ul className="divide-y divide-[#c9c0a6] rounded-md border border-[#a49b82]">
              {mine.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 text-[12px] text-ink"
                >
                  <div className="min-w-0">
                    <p className="font-bold" dir="auto">
                      {s.title}
                    </p>
                    <p className="text-ink-muted">
                      {getCategory(s.category)?.name ?? 'بدون دسته‌بندی'} · ${s.price} ·{' '}
                      {formatDate(s.createdAt)}
                      {s.note ? ` · نظر بررسی‌کننده: ${s.note}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[s.status]}`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                    <button type="button" className="link" onClick={() => setEditing(s)}>
                      ویرایش
                    </button>
                    <button type="button" className="link" onClick={() => remove(s.id)}>
                      حذف
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
