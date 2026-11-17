'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { fileNote } from '@/lib/admin-products';
import { getCategory } from '@/lib/catalog';
import { formatDate, money } from '@/lib/format';
import { licensePrice, listLicensePrice } from '@/lib/pricing';
import { combineRating } from '@/lib/rating';
import type { Author, LicenseType, Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/hydration';
import { ratingsFor, useReviews } from '@/store/reviews';
import { useUI } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';
import Avatar from './Avatar';
import Badge from './Badge';
import { CartIcon, HeartIcon } from './Icons';
import LeafRating from './LeafRating';

const LICENSE_NOTES: Record<LicenseType, string> = {
  Personal: 'Your own non-commercial projects.',
  Commercial: 'One commercial or client project.',
  Extended: 'Products you sell to many end users.',
};

export default function BuyBox({ product, author }: { product: Product; author?: Author }) {
  const [license, setLicense] = useState<LicenseType>('Personal');
  const router = useRouter();
  const hydrated = useHydrated();
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines.find((l) => l.kind === 'product' && l.id === product.id));
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);
  const extra = useReviews((s) => ratingsFor(s.reviews, product.id));
  const { average, votes } = combineRating(product.rating, product.votes, hydrated ? extra : []);
  const price = licensePrice(product, license);
  const list = listLicensePrice(product, license);

  const rows: [string, string][] = [
    ['Format', product.fileTypes.join(', ')],
    ['File size', product.fileSize],
    ['Version', product.version],
    ['Last update', formatDate(product.updatedAt)],
    ['Released', formatDate(product.createdAt)],
    ['Compatibility', product.compatibility.join(', ')],
    ['Category', getCategory(product.category)?.name ?? product.category],
  ];

  return (
    <div className="space-y-[14px]">
      <section className="frame on-paper p-3" aria-labelledby="buy-h">
        <h2 id="buy-h" className="sr-only">
          Buy this file
        </h2>
        <div className="flex flex-wrap gap-1">
          {product.badges.map((b) => (
            <Badge key={b} type={b} />
          ))}
        </div>
        <p className="mt-1 font-display text-[28px] font-bold leading-none text-ink">
          {money(price)}
          {list !== price && <s className="ml-2 text-[14px] font-normal text-ink-muted">{money(list)}</s>}
        </p>
        <div className="mt-1">
          <LeafRating rating={average} votes={votes} />
        </div>
        <fieldset className="mt-3">
          <legend className="label">Choose a licence</legend>
          <div className="space-y-1.5">
            {product.licenses.map((l) => (
              <label
                key={l.type}
                className={`flex cursor-pointer items-start justify-between gap-2 rounded-md border p-2 ${license === l.type ? 'border-leaf-dark bg-paper-light' : 'border-[#a49b82]'}`}
              >
                <span className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="license"
                    className="mt-1"
                    checked={license === l.type}
                    onChange={() => setLicense(l.type)}
                  />
                  <span>
                    <span className="block text-[13px] font-bold">{l.type}</span>
                    <span className="block text-[11px] text-ink-muted">{LICENSE_NOTES[l.type]}</span>
                  </span>
                </span>
                <span className="text-[13px] font-bold">{money(licensePrice(product, l.type))}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            className="btn !py-2"
            onClick={() => {
              add({ kind: 'product', id: product.id, license });
              toast(`Added with ${license} licence`);
            }}
          >
            <CartIcon size={14} /> {hydrated && inCart ? `Update cart (${license})` : 'Add to cart'}
          </button>
          <button
            type="button"
            className={`btn-ghost !px-3 ${wished ? '!bg-sale !text-white' : ''}`}
            aria-pressed={wished}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => toggle(product.id)}
          >
            <HeartIcon size={15} filled={wished} />
          </button>
          <button
            type="button"
            className="btn-olive col-span-2 !py-2"
            onClick={() => {
              add({ kind: 'product', id: product.id, license });
              router.push('/checkout/');
            }}
          >
            Buy now
          </button>
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          Instant download · lifetime updates · 14-day refund if broken
        </p>
      </section>

      <section className="frame on-paper p-3" aria-labelledby="info-h">
        <h2 id="info-h" className="widget-title mb-2">
          File info
        </h2>
        <table className="w-full text-[12px]">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-[#c2b99f] last:border-b-0">
                <th scope="row" className="py-1 pr-2 text-left font-semibold text-ink-muted">
                  {k}
                </th>
                <td className="py-1 text-right text-ink">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {product.fileExt !== undefined && (
          <p className="mt-2 text-[11px] text-ink-muted" data-testid="file-note">
            You download: {fileNote(product.fileExt, product.fileSize)}, exactly as uploaded.
          </p>
        )}
      </section>

      {author && (
        <section className="frame on-paper p-3" aria-labelledby="author-h">
          <h2 id="author-h" className="widget-title mb-2">
            About the author
          </h2>
          <div className="flex items-center gap-2">
            <Avatar seed={author.avatarSeed} name={author.name} size={40} />
            <div>
              <Link href={`/authors/${author.id}/`} className="link text-[14px]">
                {author.name}
              </Link>
              <p className="text-[11px] text-ink-muted">
                {author.location} · {author.sales.toLocaleString('en-US')} sales · {author.rating.toFixed(1)}{' '}
                avg
              </p>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-ink">{author.bio}</p>
        </section>
      )}
    </div>
  );
}
