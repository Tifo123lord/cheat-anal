import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/Layout';
import ProductView from './ProductView';

export const metadata: Metadata = { title: 'File', robots: { index: false } };

/** Client-rendered product page for files added in the admin panel (they exist only in this browser). */
export default function ProductViewPage() {
  return (
    <Suspense
      fallback={
        <Container className="mt-3">
          <div className="frame h-72 p-4">
            <div className="skeleton h-full w-full" />
          </div>
        </Container>
      }
    >
      <ProductView />
    </Suspense>
  );
}
