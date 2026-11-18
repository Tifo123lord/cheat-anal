import type { Product } from './types';

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export function changelog(product: Product): ChangelogEntry[] {
  const [maj, min, patch] = product.version.split('.').map(Number);
  const entries: ChangelogEntry[] = [
    {
      version: product.version,
      date: product.updatedAt,
      notes: [
        'بهبود پیش‌نمایش‌ها و نام‌گذاری فایل‌ها',
        'رفع مشکلات کوچک فاصله‌گذاری که خریداران گزارش داده بودند',
      ],
    },
  ];
  if (patch > 0 || min > 0) {
    entries.push({
      version: `${maj}.${Math.max(0, min - 1)}.0`,
      date: product.createdAt,
      notes: ['اضافه شدن نسخه‌های جدید', 'بهبود مستندات'],
    });
  }
  entries.push({ version: `${maj}.0.0`, date: product.createdAt, notes: ['انتشار اولیه'] });
  return entries;
}

export const PRODUCT_FAQ: { q: string; a: string }[] = [
  {
    q: 'به کدام لایسنس نیاز دارم؟',
    a: 'لایسنس شخصی برای پروژه‌های غیرتجاری خودت است. لایسنس تجاری برای یک مشتری یا یک پروژهٔ تجاری است. لایسنس گسترده برای محصولاتی است که به تعداد زیادی کاربر نهایی می‌فروشی، مثل قالب یا اپلیکیشن.',
  },
  {
    q: 'به‌روزرسانی‌های بعدی را هم می‌گیرم؟',
    a: 'بله. هر خرید شامل به‌روزرسانی مادام‌العمر است و نسخه‌های جدید خودکار در کتابخانه‌ات ظاهر می‌شوند.',
  },
  {
    q: 'امکان بازگشت وجه هست؟',
    a: 'اگر فایل خراب باشد یا با توضیحاتش نخواند، تا ۱۴ روز پول را برمی‌گردانیم. کافی است از طریق مرکز راهنما پیام بدهی.',
  },
  {
    q: 'دانلود چطور انجام می‌شود؟',
    a: 'بعد از پرداخت، فایل‌ها همراه کلید لایسنس در کتابخانه‌ات ظاهر می‌شوند و هر وقت خواستی می‌توانی دوباره دانلودشان کنی.',
  },
];
