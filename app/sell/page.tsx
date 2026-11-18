import type { Metadata } from 'next';
import Link from 'next/link';
import { TwoColumn } from '@/components/Layout';

export const metadata: Metadata = {
  title: 'با ما بفروشید',
  description:
    'سازندهٔ Cheat & Anal شو: ۷۰٪ هر فروش برای خودت، تسویهٔ ماهانه و دسترسی به خریدارانی که قدر کار باکیفیت را می‌دانند.',
  alternates: { canonical: '/sell/' },
};

const STEPS = [
  ['حسابت را بساز', 'در یک دقیقه ثبت‌نام کن و کمی از کارت برایمان بگو.'],
  [
    'اولین فایلت را آپلود کن',
    'از داشبوردت پیش‌نمایش، توضیحات، برچسب و فایل قابل دانلود (با هر فرمتی) اضافه کن.',
  ],
  [
    'ما بررسی‌اش می‌کنیم',
    'یک آدم واقعی ظرف یک روز کاری هر فایل را بررسی می‌کند و نکته‌های دوستانه می‌فرستد.',
  ],
  ['درآمدت را بگیر', '۷۰٪ هر فروش مال توست. وقتی موجودی‌ات به ۵۰ دلار رسید، درخواست تسویه بده.'],
];

export default function SellPage() {
  return (
    <TwoColumn>
      <article className="frame on-paper p-4 sm:p-6">
        <h1 className="page-title">با ما بفروشید</h1>
        <p className="mt-1 text-[14px] text-ink">
          Cheat &amp; Anal بازارچه‌ای کوچک و صمیمی برای آدم‌هایی است که چیزهای دیجیتال را با دقت می‌سازند.
          مخاطبانی پیدا کن که کیفیت را به کمیت ترجیح می‌دهند.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rounded-md border border-[#a49b82] bg-paper-light/60 p-3">
              <p className="font-display text-[13px] font-bold text-[color:var(--link-strong)]">
                مرحلهٔ {i + 1}
              </p>
              <h2 className="font-serif text-[15px] font-bold text-ink">{t}</h2>
              <p className="text-[12px] text-ink">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/register/" className="btn">
            سازنده شو
          </Link>
          <Link href="/dashboard/" className="btn-olive">
            رفتن به داشبورد سازنده
          </Link>
        </div>
        <section
          id="advertise"
          className="mt-6 rounded-md border border-[#a49b82] p-3"
          aria-labelledby="adv-h"
        >
          <h2 id="adv-h" className="font-display text-[16px] font-bold text-ink">
            تبلیغ در Cheat &amp; Anal
          </h2>
          <p className="text-[13px] text-ink">
            جایگاه‌های ستون کناری در همهٔ صفحه‌ها به چشم طراحان و برنامه‌نویسان می‌آیند. در این نسخهٔ نمایشی
            فقط تبلیغات خودمان نمایش داده می‌شود؛ از طریق{' '}
            <Link href="/info/contact/" className="link">
              صفحهٔ تماس
            </Link>{' '}
            برایمان بنویس.
          </p>
        </section>
      </article>
    </TwoColumn>
  );
}
