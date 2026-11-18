'use client';

import { useState } from 'react';
import FormField from '@/components/FormField';
import { passwordProblem } from '@/lib/password';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';

export default function AdminPassword() {
  const changePassword = useAuth((s) => s.changePassword);
  const toast = useUI((s) => s.toast);
  const [v, setV] = useState({ current: '', next: '', confirm: '' });
  const [err, setErr] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);

  return (
    <form
      noValidate
      className="max-w-[420px] space-y-3"
      aria-labelledby="adm-pw-h"
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: typeof err = {};
        if (!v.current) errs.current = 'رمز عبور فعلی را وارد کن.';
        const p = passwordProblem(v.next);
        if (p) errs.next = p;
        if (v.confirm !== v.next) errs.confirm = 'رمزهای عبور یکسان نیستند.';
        if (!Object.keys(errs).length) {
          setBusy(true);
          const msg = await changePassword(v.current, v.next);
          setBusy(false);
          if (msg) {
            if (/current|فعلی/i.test(msg)) errs.current = msg;
            else errs.next = msg;
          }
        }
        setErr(errs);
        if (!Object.keys(errs).length) {
          setV({ current: '', next: '', confirm: '' });
          toast('رمز عبور مدیر تغییر کرد');
        }
      }}
    >
      <h2 id="adm-pw-h" className="widget-title">
        تغییر رمز عبور مدیر
      </h2>
      <FormField
        id="adm-pw-cur"
        label="رمز عبور فعلی"
        type="password"
        autoComplete="current-password"
        value={v.current}
        onChange={(e) => setV({ ...v, current: e.target.value })}
        error={err.current}
      />
      <FormField
        id="adm-pw-new"
        label="رمز عبور جدید (حداقل ۸ کاراکتر)"
        type="password"
        autoComplete="new-password"
        value={v.next}
        onChange={(e) => setV({ ...v, next: e.target.value })}
        error={err.next}
      />
      <FormField
        id="adm-pw-confirm"
        label="تکرار رمز عبور جدید"
        type="password"
        autoComplete="new-password"
        value={v.confirm}
        onChange={(e) => setV({ ...v, confirm: e.target.value })}
        error={err.confirm}
      />
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'در حال ذخیره…' : 'تغییر رمز عبور'}
      </button>
    </form>
  );
}
