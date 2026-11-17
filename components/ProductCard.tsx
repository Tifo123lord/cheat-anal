'use client';

import Link from 'next/link';
import { authorName, productHref } from '@/lib/catalog';
import { compact, money } from '@/lib/format';
import { combineRating } from '@/lib/rating';
import type { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useHydrated } from '@/store/hydration';
import { ratingsFor, useReviews } from '@/store/reviews';
import { useUI } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';
import Badge from './Badge';
import { CartIcon, CheckIcon, EyeIcon, HeartIcon } from './Icons';
import LeafRating from './LeafRating';
import ProductImage from './ProductImage';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const hydrated = useHydrated();
  const inCart = useCart((s) => s.lines.some((l) => l.kind === 'product' && l.id === product.id));
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const extra = useReviews((s) => ratingsFor(s.reviews, product.id));
  const openQuickView = useUI((s) => s.openQuickView);
  const toast = useUI((s) => s.toast);
  const { average, votes } = combineRating(product.rating, product.votes, hydrated ? extra : []);
  const href = productHref(product);
  const titleId = `t-${product.id}`;
  const [name, kind] = product.title.split(' — ');

  return (
    <article className="card frame flex flex-col p-[7px]" aria-labelledby={titleId}>
      <header className="mb-1 flex items-baseline justify-between gap-2 px-0.5">
        <h3
          id={titleId}
          className="min-w-0 truncate font-serif text-[13.5px] font-bold leading-tight text-[color:var(--link-strong)]"
        >
          <Link href={href} className="hover:underline">
            {name}
            <span className="sr-only"> — {kind}</span>
          </Link>
        </h3>
        <p className="shrink-0 text-[12px] font-bold text-ink">
          {product.salePrice !== undefined ? (
            <>
              <span className="sr-only">Sale price </span>
              <span className="text-[#9e2f19]">{money(product.salePrice)}</span>{' '}
              <s className="text-[10px] font-normal text-ink-muted">{money(product.price)}</s>
            </>
          ) : (
            money(product.price)
          )}
        </p>
      </header>

      <div className="thumb inset-img relative overflow-hidden">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} priority={priority} alt="" />
        </Link>
        {product.badges.length > 0 && (
          <div className="absolute left-1.5 top-1.5 flex gap-1">
            {product.badges.map((b) => (
              <Badge key={b} type={b} />
            ))}
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
          <button
            type="button"
            onClick={() => openQuickView(product.id)}
            className="rounded-full border border-[#23221a] bg-olive-dark/90 p-1.5 text-ink-light hover:bg-olive"
            aria-label={`Quick view ${name}`}
          >
            <EyeIcon size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              toggle(product.id);
              toast(wished ? 'Removed from wishlist' : 'Saved to wishlist');
            }}
            aria-pressed={wished}
            className={`rounded-full border border-[#23221a] p-1.5 hover:bg-olive ${wished ? 'bg-sale text-white' : 'bg-olive-dark/90 text-ink-light'}`}
            aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          >
            <HeartIcon size={13} filled={wished} />
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 px-0.5 text-[11px] text-ink-muted">
        <span className="truncate">
          by <span className="font-semibold text-ink">{authorName(product.authorId)}</span>
        </span>
        <span className="shrink-0">{compact(product.sales)} sales</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-1 px-0.5">
        <ul className="flex min-w-0 flex-wrap gap-1" aria-label="File types">
          {product.fileTypes.slice(0, 3).map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            add({ kind: 'product', id: product.id, license: 'Personal' });
            toast(`${name} added to cart`);
          }}
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-bold ${inCart ? 'border-leaf-dark bg-paper-light text-[color:var(--link-strong)]' : 'border-[#6e0713] bg-leaf text-white hover:brightness-110'}`}
          aria-label={inCart ? `${name} is in your cart, add again to update` : `Add ${name} to cart`}
        >
          <span className="inline-flex items-center gap-1">
            {inCart ? <CheckIcon size={11} /> : <CartIcon size={11} />}
            {inCart ? 'In cart' : 'Add to cart'}
          </span>
        </button>
      </div>
      <div className="mt-1.5 border-t border-[#c2b99f] px-0.5 pt-1">
        <LeafRating rating={average} votes={votes} size={16} />
      </div>
    </article>
  );
}
