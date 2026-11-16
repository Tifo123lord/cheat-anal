'use client';

import Link from 'next/link';
import { useState } from 'react';
import FormField from '@/components/FormField';
import { isEmail } from '@/lib/validation';

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div role="status" className="space-y-3 text-[13px] text-ink">
        <p>
          If an account exists for <strong>{email}</strong>, a reset link is on its way. (Demo: no email is
          actually sent.)
        </p>
        <Link href="/login/" className="btn">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isEmail(email)) return setError('Enter the email you signed up with.');
        setError('');
        setSent(true);
      }}
    >
      <FormField
        id="fp-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />
      <button type="submit" className="btn w-full !py-2">
        Send reset link
      </button>
      <p className="text-center text-[12px]">
        <Link href="/login/" className="link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
