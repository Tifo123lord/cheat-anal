import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/Layout';
import SuccessView from './SuccessView';

export const metadata: Metadata = { title: 'Order complete', robots: { index: false } };

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <Container className="mt-3">
          <div className="frame mx-auto h-48 max-w-[720px] p-6">
            <div className="skeleton h-full w-full" />
          </div>
        </Container>
      }
    >
      <SuccessView />
    </Suspense>
  );
}
