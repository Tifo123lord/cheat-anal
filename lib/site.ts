import { BASE_PATH } from './asset';

export const SITE = {
  name: 'Cheat & Anal',
  /** Short brand name for tight spots (PWA short_name, favicon). */
  shortName: 'C&A',
  tagline: 'فایل‌های دیجیتال، با حوصله و دقت.',
  description:
    'Cheat & Anal یک بازارچهٔ مستقل برای قالب‌های وب‌سایت، کیت‌های رابط کاربری، فونت، پک آیکون، ماکاپ، فایل‌های سه‌بعدی، پریست، کتاب الکترونیکی و سورس‌کد است.',
  /** Absolute site root including the base path, e.g. https://tifo123lord.github.io/cheat-anal (no trailing slash). */
  url: `${(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cheat-anal.example').replace(/\/+$/, '')}${BASE_PATH}`,
};
