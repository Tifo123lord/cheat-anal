'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import FormField from '@/components/FormField';
import { passwordProblem } from '@/lib/password';
import { isEmail, safeNext, type Errors } from '@/lib/validation';
import { useAuth } from '@/store/auth';
import { useHydrated } from '@/store/hydration';

type F = 'name' | 'email' | 'password' | 'confirm' | 'terms' | 'form';

export default function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const [busy, setBusy] = useState(false);
  const hydrated = useHydrated();
  const register = useAuth((s) => s.register);
  const [v, setV] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState<Errors<F>>({});
  const set = (k: keyof typeof v, val: string | boolean) => setV((x) => ({ ...x, [k]: val }));

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const errs: Errors<F> = {};
        if (v.name.trim().length < 2) errs.name = 'لطفاً نامت را وارد کن.';
        if (!isEmail(v.email)) errs.email = 'یک ایمیل معتبر وارد کن.';
        const pwErr = passwordProblem(v.password);
        if (pwErr) errs.password = pwErr;
        if (v.confirm !== v.password) errs.confirm = 'رمزهای عبور یکسان نیستند.';
        if (!v.terms) errs.terms = 'لطفاً شرایط را بپذیر.';
        if (!Object.keys(errs).length) {
          setBusy(true);
          const msg = await register(v.name, v.email, v.password);
          setBusy(false);
          if (msg) errs.form = msg;
        }
        setErrors(errs);
        if (!Object.keys(errs).length) router.push(next);
      }}
    >
      <FormField
        id="reg-name"
        label="نام"
        autoComplete="name"
        value={v.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
      />
      <FormField
        id="reg-email"
        label="ایمیل"
        type="email"
        autoComplete="email"
        value={v.email}
        onChange={(e) => set('email', e.target.value)}
        error={errors.email}
      />
      <FormField
        id="reg-password"
        label="رمز عبور"
        type="password"
        autoComplete="new-password"
        value={v.password}
        onChange={(e) => set('password', e.target.value)}
        error={errors.password}
        hint="دست‌کم ۸ کاراکتر، همراه با یک عدد."
      />
      <FormField
        id="reg-confirm"
        label="تکرار رمز عبور"
        type="password"
        autoComplete="new-password"
        value={v.confirm}
        onChange={(e) => set('confirm', e.target.value)}
        error={errors.confirm}
      />
      <div>
        <label className="flex items-start gap-2 text-[12px] text-ink">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={v.terms}
            onChange={(e) => set('terms', e.target.checked)}
            aria-invalid={Boolean(errors.terms)}
            aria-describedby={errors.terms ? 'reg-terms-err' : undefined}
          />
          <span>
            با{' '}
            <Link href="/info/terms/" className="link">
              شرایط استفاده
            </Link>{' '}
            و{' '}
            <Link href="/info/privacy/" className="link">
              سیاست حریم خصوصی
            </Link>{' '}
            موافقم.
          </span>
        </label>
        {errors.terms && (
          <p id="reg-terms-err" className="error-text">
            {errors.terms}
          </p>
        )}
      </div>
      {errors.form && (
        <p className="error-text" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" className="btn w-full !py-2" disabled={!hydrated || busy}>
        {busy ? 'در حال ساخت حساب…' : 'ساخت حساب'}
      </button>
      <p className="text-center text-[12px] text-ink">
        قبلاً ثبت‌نام کرده‌ای؟{' '}
        <Link href="/login/" className="link">
          وارد شو
        </Link>
      </p>
    </form>
  );
}
