import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaperPage } from '@/components/Layout';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default function LoginPage() {
  return (
    <PaperPage title="Sign in" intro="Welcome back to the greenhouse." wide={false}>
      <Suspense fallback={<div className="skeleton h-56 w-full" />}>
        <LoginForm />
      </Suspense>
    </PaperPage>
  );
}
