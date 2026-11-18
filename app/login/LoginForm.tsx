'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import FormField from '@/components/FormField';
import { MIN_PASSWORD } from '@/lib/password';
import { isEmail, safeNext, type Errors } from '@/lib/validation';
import { useAuth } from '@/store/auth';
import { useHydrated } from '@/store/hydration';

export default function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const hydrated = useHydrated();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors<'email' | 'password' | 'form'>>({});
  const [busy, setBusy] = useState(false);

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const errs: typeof errors = {};
        if (!isEmail(email)) errs.email = 'یک ایمیل معتبر وارد کن.';
        if (password.length < MIN_PASSWORD) errs.password = `رمز عبور دست‌کم ${MIN_PASSWORD} کاراکتر است.`;
        if (!errs.email && !errs.password) {
          setBusy(true);
          const msg = await login(email, password);
          setBusy(false);
          if (msg) errs.form = msg;
        }
        setErrors(errs);
        if (!Object.keys(errs).length) router.push(next);
      }}
    >
      <FormField
        id="login-email"
        label="ایمیل"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <FormField
        id="login-password"
        label="رمز عبور"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      {errors.form && (
        <p className="error-text" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" className="btn w-full !py-2" disabled={!hydrated || busy}>
        {busy ? 'در حال ورود…' : 'ورود'}
      </button>
      <div className="flex justify-between text-[12px]">
        <Link href="/forgot-password/" className="link">
          رمز عبور را فراموش کرده‌ای؟
        </Link>
        <Link
          href={next === '/account/' ? '/register/' : `/register/?next=${encodeURIComponent(next)}`}
          className="link"
        >
          ساخت حساب کاربری
        </Link>
      </div>
    </form>
  );
}
