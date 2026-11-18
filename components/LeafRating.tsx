'use client';

import { useId, useState } from 'react';
import { leafFills, ratingLabel } from '@/lib/rating';

const LEAF = 'M12 2.5 C 18.5 6, 19.5 15, 12 21.5 C 4.5 15, 5.5 6, 12 2.5Z';

function Leaf({ fill, size }: { fill: number; size: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className="leaf-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`c${id}`}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path d={LEAF} fill="#c9c0a6" stroke="#8f8770" strokeWidth="1" transform="rotate(-35 12 12)" />
      <path
        className="leaf-fill"
        d={LEAF}
        fill="#e0102a"
        stroke="#a30b1e"
        strokeWidth="1"
        transform="rotate(-35 12 12)"
        clipPath={`url(#c${id})`}
      />
      <path
        d="M12 4 V20"
        stroke={fill > 0.5 ? '#ffb3bc' : '#ddd5bf'}
        strokeWidth="0.9"
        transform="rotate(-35 12 12)"
      />
    </svg>
  );
}

export function LeafRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span
      className="leaf-row inline-flex items-center gap-[1px]"
      role="img"
      aria-label={`${rating.toFixed(1)} از ۵ برگ`}
    >
      {leafFills(rating).map((f, i) => (
        <Leaf key={i} fill={f} size={size} />
      ))}
    </span>
  );
}

export default function LeafRating({
  rating,
  votes,
  size = 14,
}: {
  rating: number;
  votes: number;
  size?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <LeafRow rating={rating} size={size} />
      <span className="text-[10px] text-ink-muted">{ratingLabel(rating, votes)}</span>
    </div>
  );
}

/** Accessible leaf picker: a radio group of five leaves. */
export function LeafInput({
  value,
  onChange,
  name,
  invalid,
  describedBy,
}: {
  value: number;
  onChange: (v: number) => void;
  name: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div
      role="radiogroup"
      aria-label="امتیاز تو"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="cursor-pointer rounded" onMouseEnter={() => setHover(n)}>
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
            className="peer sr-only"
            aria-label={`${n} برگ`}
          />
          <span className="inline-block rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-olive-dark">
            <Leaf fill={n <= shown ? 1 : 0} size={24} />
          </span>
        </label>
      ))}
      <span className="ms-2 text-[12px] text-ink-muted">
        {value ? `${value} از 5` : 'از ۱ تا ۵ انتخاب کن'}
      </span>
    </div>
  );
}
