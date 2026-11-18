import type { Metadata } from 'next';
import { TwoColumn } from '@/components/Layout';
import FreeFiles from './FreeFiles';

export const metadata: Metadata = {
  title: 'فایل‌های رایگان',
  description: 'فایل‌های رایگان Cheat & Anal؛ با ایمیلت بازشان کن.',
  alternates: { canonical: '/free-files/' },
};

export default function FreeFilesPage() {
  return (
    <TwoColumn>
      <div className="frame on-paper mb-[14px] p-3">
        <h1 className="page-title !text-[19px]">فایل‌های رایگان</h1>
        <p className="text-[12px] text-ink-muted">فایل‌های رایگان با لایسنس شخصی که با ایمیلت باز می‌شوند.</p>
      </div>
      <FreeFiles />
    </TwoColumn>
  );
}
