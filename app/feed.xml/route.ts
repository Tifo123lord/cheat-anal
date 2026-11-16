import { products } from '@/lib/catalog';
import { sortProducts } from '@/lib/filters';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const items = sortProducts(products, 'newest')
    .slice(0, 20)
    .map(
      (p) =>
        `<item><title>${esc(p.title)}</title><link>${SITE.url}/product/${p.slug}/</link><guid>${SITE.url}/product/${p.slug}/</guid><pubDate>${new Date(`${p.createdAt}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`,
    )
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE.name}</title><link>${SITE.url}</link><description>${esc(SITE.tagline)}</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
