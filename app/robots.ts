import type { MetadataRoute } from 'next';
import { asset } from '@/lib/asset';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: asset('/'),
        disallow: ['/cart/', '/checkout/', '/library/', '/account/', '/admin/', '/dashboard/'].map(asset),
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
