import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaperPage } from '@/components/Layout';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'Create an account', robots: { index: false } };

export default function RegisterPage() {
  return (
    <PaperPage title="Create an account" intro="Buy, download and sell files. Free, forever." wide={false}>
      <Suspense fallback={<div className="skeleton h-72 w-full" />}>
        <RegisterForm />
      </Suspense>
    </PaperPage>
  );
}
