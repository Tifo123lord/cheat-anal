import FeaturedSlider from '@/components/FeaturedSlider';
import HomeGrid from '@/components/HomeGrid';
import { TwoColumn } from '@/components/Layout';
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
    <TwoColumn>
      <h1 className="sr-only">
        {SITE.name} — {SITE.tagline}
      </h1>
      <FeaturedSlider items={featured} />
      <HomeGrid items={latest} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </TwoColumn>
  );
}
