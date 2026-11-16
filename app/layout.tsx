import type { Metadata, Viewport } from 'next';
import { Lora, Open_Sans, Quicksand } from 'next/font/google';
import Aurora from '@/components/Aurora';
import Footer from '@/components/Footer';
import MobileBar from '@/components/MobileBar';
import QuickView from '@/components/QuickView';
import SiteHeader from '@/components/SiteHeader';
import StoreHydrator from '@/components/StoreHydrator';
import Toaster from '@/components/Toaster';
import { asset } from '@/lib/asset';
import { SITE } from '@/lib/site';
import '@/styles/globals.css';

const display = Quicksand({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
});
const body = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});
const serif = Lora({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'templates',
    'UI kits',
    'fonts',
    'icons',
    'mockups',
    '3D assets',
    'presets',
    'ebooks',
    'source code',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: '/',
    images: [
      {
        url: `${SITE.url}/og.png`,
        width: 1200,
        height: 630,
        alt: 'leafpress — Digital files, grown with care.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
    images: [`${SITE.url}/og.png`],
  },
  icons: { icon: asset('/icon.svg') },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body className="relative min-h-screen">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-paper px-3 py-2 text-ink focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Skip to content
        </a>
        <Aurora />
        <SiteHeader />
        <main id="main" className="relative z-10 pb-6">
          {children}
        </main>
        <Footer />
        <MobileBar />
        <QuickView />
        <Toaster />
        <StoreHydrator />
      </body>
    </html>
  );
}
