'use client';

import { useId, useState } from 'react';
import { isEmail } from '@/lib/validation';

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <p className="text-[12px] font-semibold text-[color:var(--link-strong)]" role="status">
        Thanks! Look out for fresh files every Friday.
      </p>
    );
  }
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!isEmail(email)) {
          setError('Please enter a valid email address.');
          return;
        }
        setError('');
        setDone(true);
      }}
    >
      <label htmlFor={`${id}-e`} className={compact ? 'sr-only' : 'mb-1 block text-[12px]'}>
        Weekly picks and freebies in your inbox.
      </label>
      <div className="flex gap-1.5">
        <input
          id={`${id}-e`}
          type="email"
          className="field !py-1.5 text-[12px]"
          placeholder="you@example.com"
          value={email}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn shrink-0 !px-3">
          Join
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} className="error-text">
          {error}
        </p>
      )}
    </form>
  );
}
