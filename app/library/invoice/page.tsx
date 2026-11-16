import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/Layout';
import InvoiceView from './InvoiceView';

export const metadata: Metadata = { title: 'Invoice', robots: { index: false } };

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <Container className="mt-3">
          <div className="frame mx-auto h-64 max-w-[720px] p-6">
            <div className="skeleton h-full w-full" />
          </div>
        </Container>
      }
    >
      <InvoiceView />
    </Suspense>
  );
}
