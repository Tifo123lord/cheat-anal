import type { Metadata } from 'next';
import { TwoColumn } from '@/components/Layout';
import NewReleases from './NewReleases';

export const metadata: Metadata = {
  title: 'تازه‌ها',
  description: 'تازه‌ترین فایل‌های دیجیتال Cheat & Anal؛ تازه بررسی‌شده و آمادهٔ دانلود.',
  alternates: { canonical: '/new-releases/' },
};

export default function NewReleasesPage() {
  return (
    <TwoColumn>
      <NewReleases />
    </TwoColumn>
  );
}
