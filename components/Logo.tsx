import Link from 'next/link';
import { asset } from '@/lib/asset';
import { SITE } from '@/lib/site';

/** Intrinsic size of the trimmed wordmark (public/brand/logo-*.webp): stacked "CHEAT / & ANAL", white with a red slash. */
const LOGO_W = 953;
const LOGO_H = 697;

/**
 * "Cheat & Anal" wordmark. The artwork is white on transparent, so it must sit on a dark
 * background (the header and footer are both on --bg-night).
 */
export default function Logo({ small = false }: { small?: boolean }) {
  const sizes = small ? '82px' : '(min-width: 768px) 132px, 88px';
  return (
    <Link
      href="/"
      className="relative inline-block shrink-0 leading-none no-underline"
      aria-label={`صفحهٔ اصلی ${SITE.name}`}
    >
      <picture>
        <source
          type="image/webp"
          srcSet={`${asset('/brand/logo-160.webp')} 160w, ${asset('/brand/logo-240.webp')} 240w, ${asset('/brand/logo-320.webp')} 320w, ${asset('/brand/logo-480.webp')} 480w`}
          sizes={sizes}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; srcset of pre-sized webp files */}
        <img
          src={asset('/brand/logo-320.png')}
          alt={SITE.name}
          width={LOGO_W}
          height={LOGO_H}
          decoding="async"
          fetchPriority={small ? 'low' : 'high'}
          className={`block h-auto drop-shadow-[0_2px_3px_rgba(0,0,0,.6)] ${small ? 'w-[82px]' : 'w-[88px] md:w-[132px]'}`}
        />
      </picture>
    </Link>
  );
}
