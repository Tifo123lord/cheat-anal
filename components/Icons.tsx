import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...rest }: IconProps): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const CartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
    <circle cx="10" cy="20" r="1.3" />
    <circle cx="17" cy="20" r="1.3" />
  </svg>
);
export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-9-9.1C1.8 7.7 4 4.5 7.2 4.5c2 0 3.4 1.1 4.8 2.9 1.4-1.8 2.8-2.9 4.8-2.9 3.2 0 5.4 3.2 4.2 6.4C19 15.6 12 20 12 20Z" />
  </svg>
);
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6" />
  </svg>
);
export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const EyeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const DownloadIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16" />
  </svg>
);
/** Directional arrows mirror in RTL (`rtl:-scale-x-100`), so "next" always points forward. */
export const ArrowRight = ({ className = '', ...p }: IconProps) => (
  <svg {...base(p)} className={`rtl:-scale-x-100 ${className}`.trim()}>
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);
export const ArrowLeft = ({ className = '', ...p }: IconProps) => (
  <svg {...base(p)} className={`rtl:-scale-x-100 ${className}`.trim()}>
    <path d="M19 12H5m5-5-5 5 5 5" />
  </svg>
);
export const ChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const FilterIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5Z" />
  </svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 4.5v15l12.5-7.5L7 4.5Z" fill="currentColor" />
  </svg>
);
export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);
/* Generic social marks (no third-party logos). */
export const RssIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 19h.01M5 12a7 7 0 0 1 7 7M5 5a14 14 0 0 1 14 14" />
  </svg>
);
export const ChatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h16v11H9l-5 4V5Z" />
  </svg>
);
export const CameraIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="7" width="18" height="13" rx="3" />
    <circle cx="12" cy="13.5" r="3.5" />
    <path d="M8.5 7 10 4.5h4L15.5 7" />
  </svg>
);
export const VideoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10 5-3v10l-5-3" />
  </svg>
);
export const PeopleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M3 20c.8-3.6 3.1-5.5 6-5.5s5.2 1.9 6 5.5M15.5 14.6c2.8-.3 4.8 1.4 5.5 4.4" />
  </svg>
);
export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
);
export const CardIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
    <path d="M2.5 10h19M6 15h4" />
  </svg>
);
export const WalletIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
    <circle cx="16.5" cy="13.5" r="1.3" />
  </svg>
);
export const BankIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 9.5 12 4l9 5.5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" />
  </svg>
);
export const CoinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.5 9.2c-.6-.8-1.5-1.2-2.6-1.2-1.6 0-2.6.8-2.6 2s1 1.7 2.7 2 2.8.9 2.8 2.1-1.1 2.1-2.8 2.1c-1.2 0-2.2-.5-2.8-1.3M12 6.5V8m0 8v1.5" />
  </svg>
);

/* Tiny category glyphs for the sidebar grid and filters. */
const CATEGORY_PATHS: Record<string, string> = {
  browser: 'M3 5h18v14H3zM3 9h18M6 7h.01M8.5 7h.01',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  type: 'M5 7V5h14v2M12 5v14m-3 0h6',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  device: 'M5 5h14v10H5zM2.5 18h19M15 21h4V11h-4z',
  cube: 'm12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12v9M12 12 4 7.5',
  sliders: 'M5 4v16M12 4v16M19 4v16M3 9h4M10 15h4M17 7h4',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h10',
  code: 'm8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 12',
  brush: 'M14 4l6 6-8 8H8v-4l6-10ZM4 20c2 0 4-1 4-3',
  texture: 'M4 4l16 16M4 10l10 10M10 4l10 10M4 16l4 4M16 4l4 4',
  play: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm-2 5.5v7l6-3.5-6-3.5Z',
  crosshair:
    'M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15ZM12 2v5.5M12 16.5V22M2 12h5.5M16.5 12H22M12 11.5v1',
};

export function CategoryIcon({ name, ...p }: IconProps & { name: string }) {
  return (
    <svg {...base(p)} strokeWidth={1.8}>
      <path d={CATEGORY_PATHS[name] ?? CATEGORY_PATHS.grid} />
    </svg>
  );
}
