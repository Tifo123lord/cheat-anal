import type { MetadataRoute } from 'next';
import { authors, posts, products } from '@/lib/catalog';
import { INFO_PAGES } from '@/lib/pages';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '/',
    '/shop/',
    '/new-releases/',
    '/authors/',
    '/bundles/',
    '/free-files/',
    '/sell/',
    '/journal/',
  ];
  return [
    ...staticPaths.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: 'daily' as const })),
    ...products.map((p) => ({ url: `${SITE.url}/product/${p.slug}/`, lastModified: p.updatedAt })),
    ...authors.map((a) => ({ url: `${SITE.url}/authors/${a.id}/` })),
    ...posts.map((p) => ({ url: `${SITE.url}/journal/${p.slug}/`, lastModified: p.date })),
    ...INFO_PAGES.map((p) => ({ url: `${SITE.url}/info/${p.slug}/` })),
  ];
}
