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
          اگر حسابی با <bdi className="font-bold">{email}</bdi> وجود داشته باشد، لینک بازیابی در راه است.
          (نسخهٔ نمایشی: در واقع ایمیلی فرستاده نمی‌شود.)
        </p>
        <Link href="/login/" className="btn">
          بازگشت به صفحهٔ ورود
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
        if (!isEmail(email)) return setError('ایمیلی را که با آن ثبت‌نام کرده‌ای وارد کن.');
        setError('');
        setSent(true);
      }}
    >
      <FormField
        id="fp-email"
        label="ایمیل"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />
      <button type="submit" className="btn w-full !py-2">
        ارسال لینک بازیابی
      </button>
      <p className="text-center text-[12px]">
        <Link href="/login/" className="link">
          بازگشت به صفحهٔ ورود
        </Link>
      </p>
    </form>
  );
}
