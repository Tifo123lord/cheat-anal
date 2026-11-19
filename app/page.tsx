import FeaturedSlider from '@/components/FeaturedSlider';
import HomeGrid from '@/components/HomeGrid';
import { TwoColumn } from '@/components/Layout';
import LatestUpdates from '@/components/LatestUpdates';
import Sidebar from '@/components/Sidebar';
import { featuredProducts, products } from '@/lib/catalog';
import { sortProducts } from '@/lib/filters';
import { SITE } from '@/lib/site';

export default function HomePage() {
  const featured = featuredProducts();
  const latest = sortProducts(products, 'newest');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/shop/?q={query}`,
      'query-input': 'required name=query',
    },
  };
  return (
    <TwoColumn aside={<Sidebar updates={false} />}>
      <h1 className="sr-only">
        {SITE.name} — {SITE.tagline}
      </h1>
      <section className="frame on-paper mb-[14px] p-3 sm:p-4" aria-labelledby="home-updates-h">
        <h2 id="home-updates-h" className="widget-title mb-2">
          آخرین به‌روزرسانی‌ها
        </h2>
        <LatestUpdates />
      </section>
      <FeaturedSlider items={featured} />
      <HomeGrid items={latest} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </TwoColumn>
  );
}
