import Link from 'next/link';
import Accordion from '@/components/Accordion';
import BuyBox from '@/components/BuyBox';
import { Container } from '@/components/Layout';
import ProductGallery from '@/components/ProductGallery';
import ProductGrid from '@/components/ProductGrid';
import Reviews from '@/components/Reviews';
import Tabs from '@/components/Tabs';
import { authorName, getAuthor, getCategory, relatedProducts } from '@/lib/catalog';
import { PRODUCT_FAQ, changelog } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { SITE } from '@/lib/site';
import type { Product } from '@/lib/types';

/** Product detail body, shared by the static product pages and the client route for admin-added files. */
export default function ProductDetail({ product, related }: { product: Product; related?: Product[] }) {
  const author = getAuthor(product.authorId);
  const authorLabel = author?.name ?? authorName(product.authorId);
  const category = getCategory(product.category);
  const log = changelog(product);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    brand: { '@type': 'Brand', name: author?.name ?? SITE.name },
    ...(product.votes
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.votes,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.salePrice ?? product.price,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[630px_1fr] lg:gap-x-[18px]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <nav aria-label="Breadcrumb" className="mb-2 text-[12px] text-[#cfc9b4]">
            <ol className="flex flex-wrap gap-1">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>{' '}
                /
              </li>
              <li>
                <Link href={`/shop/?category=${product.category}`} className="hover:underline">
                  {category?.name}
                </Link>{' '}
                /
              </li>
              <li aria-current="page" className="text-ink-light">
                {product.title}
              </li>
            </ol>
          </nav>
          <article className="frame on-paper p-3 sm:p-4">
            <h1 className="font-serif text-[22px] font-bold leading-tight text-[color:var(--link-strong)]">
              {product.title}
            </h1>
            <p className="mb-3 text-[12px] text-ink-muted">
              by{' '}
              {author ? (
                <Link href={`/authors/${product.authorId}/`} className="link">
                  {author.name}
                </Link>
              ) : (
                <span className="font-bold">{authorLabel}</span>
              )}{' '}
              · updated {formatDate(product.updatedAt)} · {product.sales.toLocaleString('en-US')} sales
            </p>
            <ProductGallery product={product} />
            <div className="mt-4">
              <Tabs
                label="Product details"
                tabs={[
                  {
                    id: 'description',
                    label: 'Description',
                    content: (
                      <div className="prose-paper text-ink">
                        <p>{product.description}</p>
                        <ul className="mb-3 list-disc space-y-1 pl-5 text-[13px]">
                          <li>Formats: {product.fileTypes.join(', ')}</li>
                          <li>Works with {product.compatibility.join(', ')}</li>
                          <li>
                            Version {product.version}, {product.fileSize}
                          </li>
                        </ul>
                        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                          {product.tags.map((t) => (
                            <li key={t}>
                              <Link
                                href={`/shop/?q=${encodeURIComponent(t)}`}
                                className="chip hover:bg-paper-light"
                              >
                                #{t}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                  },
                  { id: 'reviews', label: 'Reviews', content: <Reviews product={product} /> },
                  {
                    id: 'changelog',
                    label: 'Changelog',
                    content: (
                      <ol className="space-y-3">
                        {log.map((e) => (
                          <li key={e.version} className="border-l-2 border-leaf pl-3">
                            <p className="text-[13px] font-bold text-ink">
                              v{e.version}{' '}
                              <span className="font-normal text-ink-muted">· {formatDate(e.date)}</span>
                            </p>
                            <ul className="list-disc pl-5 text-[13px] text-ink">
                              {e.notes.map((n) => (
                                <li key={n}>{n}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ol>
                    ),
                  },
                  { id: 'faq', label: 'FAQ', content: <Accordion items={PRODUCT_FAQ} /> },
                ]}
              />
            </div>
          </article>
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-[26px]">
          <BuyBox product={product} author={author} />
        </div>
        <section className="min-w-0 lg:col-start-1 lg:row-start-2" aria-labelledby="related-h">
          <h2 id="related-h" className="brand-heading mb-2 mt-2 text-[17px] text-ink-light">
            You might also like
          </h2>
          <ProductGrid items={related ?? relatedProducts(product, 4)} />
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Container>
  );
}
