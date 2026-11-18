import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopSkeleton from '@/components/ShopSkeleton';
import ShopView from '@/components/ShopView';

export const metadata: Metadata = {
  title: 'فروشگاه',
  description:
    'قالب، کیت رابط کاربری، فونت، آیکون، ماکاپ و کلی فایل دیگر را ببین. بر اساس دسته‌بندی، نوع فایل، قیمت، نرم‌افزار، امتیاز و لایسنس فیلتر کن.',
  alternates: { canonical: '/shop/' },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton title="همهٔ فایل‌ها" />}>
      <ShopView />
    </Suspense>
  );
}
