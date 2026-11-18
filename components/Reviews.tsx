'use client';

import { useId, useState } from 'react';
import { formatDate } from '@/lib/format';
import { combineRating, distribution } from '@/lib/rating';
import type { Product } from '@/lib/types';
import { useCurrentUser } from '@/store/auth';
import { useHydrated } from '@/store/hydration';
import { useReviews } from '@/store/reviews';
import { useUI } from '@/store/ui';
import { LeafInput, LeafRow } from './LeafRating';

export default function Reviews({ product }: { product: Product }) {
  const id = useId();
  const hydrated = useHydrated();
  const all = useReviews((s) => s.reviews);
  const addReview = useReviews((s) => s.addReview);
  const user = useCurrentUser();
  const toast = useUI((s) => s.toast);
  const mine = hydrated ? all.filter((r) => r.productId === product.id) : [];
  // No sample reviews: only reviews written by buyers in this browser.
  const list = mine;
  const summary = combineRating(
    product.rating,
    product.votes,
    mine.map((r) => r.rating),
  );
  const dist = distribution(list.map((r) => r.rating));

  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; name?: string; text?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim() || user?.name || '';
    const errs: typeof errors = {};
    if (rating < 1) errs.rating = 'بین ۱ تا ۵ برگ انتخاب کن.';
    if (n.length < 2) errs.name = 'لطفاً نامت را بنویس (حداقل ۲ کاراکتر).';
    if (text.trim().length < 10) errs.text = 'کمی بیشتر برای بقیهٔ خریداران بنویس (حداقل ۱۰ کاراکتر).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!user) {
      setErrors({ text: 'برای ثبت نظر وارد حسابت شو.' });
      return;
    }
    addReview({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: n,
      rating,
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
    }).then(
      () => {
        setRating(0);
        setText('');
        toast('ممنون! نظرت منتشر شد.');
      },
      (ex: unknown) =>
        setErrors({ text: `ثبت نظر انجام نشد: ${ex instanceof Error ? ex.message : 'خطای سرور'}.` }),
    );
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-md border border-[#bcb399] bg-paper-light/60 p-3 sm:grid-cols-[auto_1fr]">
        <div className="text-center">
          <p className="font-display text-[34px] font-bold leading-none text-ink">
            {summary.average.toFixed(1)}
          </p>
          <LeafRow rating={summary.average} size={16} />
          <p className="text-[11px] text-ink-muted">{summary.votes} رأی</p>
        </div>
        <ul className="space-y-1" aria-label="توزیع امتیاز نظرهای ثبت‌شده">
          {dist.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px] text-ink">
              <span className="w-12">{5 - i} برگ</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#c9c0a6]">
                <span
                  className="block h-full bg-leaf"
                  style={{ width: `${list.length ? (c / list.length) * 100 : 0}%` }}
                />
              </span>
              <span className="w-5 text-end">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-md border border-[#bcb399] bg-paper-light/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink" dir="auto">
                {r.name}
              </p>
              <p className="text-[11px] text-ink-muted">{formatDate(r.date)}</p>
            </div>
            <LeafRow rating={r.rating} size={13} />
            <p className="mt-1 text-[13px] text-ink" dir="auto">
              {r.text}
            </p>
          </li>
        ))}
      </ul>

      <form
        noValidate
        onSubmit={submit}
        className="rounded-md border border-[#a49b82] bg-paper-light/70 p-3"
        aria-labelledby={`${id}-h`}
      >
        <h3 id={`${id}-h`} className="mb-2 font-display text-[15px] font-bold text-ink">
          نوشتن نظر
        </h3>
        <div className="mb-2">
          <span className="label">امتیاز تو</span>
          <LeafInput
            value={rating}
            onChange={setRating}
            name={`${id}-rating`}
            invalid={Boolean(errors.rating)}
            describedBy={errors.rating ? `${id}-er` : undefined}
          />
          {errors.rating && (
            <p id={`${id}-er`} className="error-text">
              {errors.rating}
            </p>
          )}
        </div>
        <div className="mb-2">
          <label htmlFor={`${id}-n`} className="label">
            نام
          </label>
          <input
            id={`${id}-n`}
            className="field"
            value={name}
            placeholder={user?.name ?? 'نام تو'}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-en` : undefined}
          />
          {errors.name && (
            <p id={`${id}-en`} className="error-text">
              {errors.name}
            </p>
          )}
        </div>
        <div className="mb-2">
          <label htmlFor={`${id}-t`} className="label">
            متن نظر
          </label>
          <textarea
            id={`${id}-t`}
            className="field min-h-[84px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={Boolean(errors.text)}
            aria-describedby={errors.text ? `${id}-et` : undefined}
          />
          {errors.text && (
            <p id={`${id}-et`} className="error-text">
              {errors.text}
            </p>
          )}
        </div>
        <button type="submit" className="btn">
          ثبت نظر
        </button>
      </form>
    </div>
  );
}
