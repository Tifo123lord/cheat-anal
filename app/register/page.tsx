import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaperPage } from '@/components/Layout';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'ثبت‌نام', robots: { index: false } };

export default function RegisterPage() {
  return (
    <PaperPage title="ثبت‌نام" intro="فایل بخر، دانلود کن و بفروش. رایگان، برای همیشه." wide={false}>
      <Suspense fallback={<div className="skeleton h-72 w-full" />}>
        <RegisterForm />
      </Suspense>
    </PaperPage>
  );
}
