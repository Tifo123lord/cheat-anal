import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaperPage } from '@/components/Layout';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'ورود', robots: { index: false } };

export default function LoginPage() {
  return (
    <PaperPage title="ورود" intro="خوش برگشتی به گلخانه." wide={false}>
      <Suspense fallback={<div className="skeleton h-56 w-full" />}>
        <LoginForm />
      </Suspense>
    </PaperPage>
  );
}
