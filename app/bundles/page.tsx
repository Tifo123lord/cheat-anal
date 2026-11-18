import type { Metadata } from 'next';
import Link from 'next/link';
import BundleCard from '@/components/BundleCard';
import EmptyState from '@/components/EmptyState';
import { TwoColumn } from '@/components/Layout';
import { bundles } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'بسته‌ها',
  description: 'بسته‌های دست‌چین فایل، با کسری از قیمت.',
  alternates: { canonical: '/bundles/' },
};

export default function BundlesPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">بسته‌ها</h1>
        <p className="text-[12px] text-ink-muted">
          مجموعه‌هایی که کنار هم عالی کار می‌کنند. قیمت‌ها برای لایسنس شخصی است؛ لایسنس را می‌توانی در سبد
          خرید عوض کنی.
        </p>
      </div>
      {bundles.length ? (
        <ul className="space-y-[14px]">
          {bundles.map((b) => (
            <li key={b.id}>
              <BundleCard bundle={b} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="frame on-paper" data-testid="bundles-empty">
          <EmptyState title="هنوز بسته‌ای نیست">
            وقتی فایل‌های کافی برای بسته‌بندی باشد، بسته‌ها همین‌جا ظاهر می‌شوند. تا آن موقع سری به{' '}
            <Link href="/shop/" className="link">
              فروشگاه
            </Link>{' '}
            بزن.
          </EmptyState>
        </div>
      )}
    </TwoColumn>
  );
}
