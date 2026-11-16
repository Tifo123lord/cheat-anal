'use client';

import { useId, useState } from 'react';
import { seedReviews } from '@/lib/content';
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
  const list = [...mine, ...seedReviews(product)];
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
    if (rating < 1) errs.rating = 'Pick between 1 and 5 leaves.';
    if (n.length < 2) errs.name = 'Please add your name (2+ characters).';
    if (text.trim().length < 10) errs.text = 'Tell other buyers a little more (10+ characters).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    addReview({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: n,
      rating,
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    setRating(0);
    setText('');
    toast('Thanks! Your review is live.');
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-md border border-[#bcb399] bg-paper-light/60 p-3 sm:grid-cols-[auto_1fr]">
        <div className="text-center">
          <p className="font-display text-[34px] font-bold leading-none text-ink">
            {summary.average.toFixed(1)}
          </p>
          <LeafRow rating={summary.average} size={16} />
          <p className="text-[11px] text-ink-muted">{summary.votes} votes</p>
        </div>
        <ul className="space-y-1" aria-label="Rating distribution of written reviews">
          {dist.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px] text-ink">
              <span className="w-12">{5 - i} leaves</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#c9c0a6]">
                <span
                  className="block h-full bg-leaf"
                  style={{ width: `${list.length ? (c / list.length) * 100 : 0}%` }}
                />
              </span>
              <span className="w-5 text-right">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-md border border-[#bcb399] bg-paper-light/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink">{r.name}</p>
              <p className="text-[11px] text-ink-muted">{formatDate(r.date)}</p>
            </div>
            <LeafRow rating={r.rating} size={13} />
            <p className="mt-1 text-[13px] text-ink">{r.text}</p>
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
          Write a review
        </h3>
        <div className="mb-2">
          <span className="label">Your rating</span>
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
            Name
          </label>
          <input
            id={`${id}-n`}
            className="field"
            value={name}
            placeholder={user?.name ?? 'Your name'}
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
            Review
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
          Submit review
        </button>
      </form>
    </div>
  );
}
