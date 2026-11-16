import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopSkeleton from '@/components/ShopSkeleton';
import ShopView from '@/components/ShopView';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse templates, UI kits, fonts, icons, mockups and more. Filter by category, file type, price, software, rating and licence.',
  alternates: { canonical: '/shop/' },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton title="Shop all files" />}>
      <ShopView />
    </Suspense>
  );
}
