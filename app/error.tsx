'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from '@/components/Layout';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to monitoring in a real deployment; kept quiet in the demo.
    void error;
  }, [error]);
  return (
    <Container className="mt-3">
      <div role="alert" className="frame on-paper mx-auto max-w-[560px] p-6 text-center">
        <h1 className="page-title">Something wilted</h1>
        <p className="mt-1 text-[13px] text-ink">
          An unexpected error stopped this page from loading. Your cart and downloads are safe.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Go home
          </Link>
        </div>
      </div>
    </Container>
  );
}
