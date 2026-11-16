import Link from 'next/link';

type Kind = 'packly' | 'birdsong' | 'navkit';

/** Original house ads drawn in SVG. Fictional products, labelled "Advertise". */
function Art({ kind }: { kind: Kind }) {
  if (kind === 'packly') {
    return (
      <svg
        viewBox="0 0 250 120"
        className="block h-auto w-full"
        role="img"
        aria-label="Packly: bundle 10 UI kits for $50. An opened cardboard box with design files flying out."
      >
        <defs>
          <linearGradient id="pk-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6e2" />
            <stop offset="1" stopColor="#f6dfb0" />
          </linearGradient>
        </defs>
        <rect width="250" height="120" fill="url(#pk-bg)" />
        <text x="12" y="38" fontFamily="Georgia,serif" fontWeight="bold" fontSize="30" fill="#c8571f">
          Packly
        </text>
        <text x="12" y="58" fontFamily="Verdana,sans-serif" fontSize="10" fill="#5a3a1a">
          Bundle 10 UI kits
        </text>
        <text x="12" y="72" fontFamily="Verdana,sans-serif" fontSize="10" fill="#5a3a1a">
          for one small price
        </text>
        <rect x="12" y="84" width="74" height="20" rx="10" fill="#c8571f" />
        <text
          x="49"
          y="98"
          textAnchor="middle"
          fontFamily="Verdana,sans-serif"
          fontWeight="bold"
          fontSize="10"
          fill="#fff"
        >
          Get bundle
        </text>
        {/* opened box */}
        <path d="M140 70 L180 84 L220 70 L220 108 L180 118 L140 108Z" fill="#c98f4f" />
        <path d="M180 84 L180 118 L220 108 L220 70Z" fill="#b07a3c" />
        <path d="M140 70 L118 56 L160 46 L180 60Z" fill="#dcaa6a" />
        <path d="M220 70 L240 54 L200 44 L180 60Z" fill="#d49e5c" />
        <rect x="150" y="26" width="26" height="20" rx="2" fill="#7fa23a" transform="rotate(-14 163 36)" />
        <rect x="178" y="18" width="24" height="18" rx="2" fill="#3f6fb5" transform="rotate(10 190 27)" />
        <rect x="196" y="34" width="20" height="16" rx="2" fill="#e8c25c" transform="rotate(22 206 42)" />
        <circle cx="222" cy="28" r="20" fill="#c2452d" />
        <text
          x="222"
          y="33"
          textAnchor="middle"
          fontFamily="Verdana,sans-serif"
          fontWeight="bold"
          fontSize="13"
          fill="#fff"
        >
          $50
        </text>
      </svg>
    );
  }
  if (kind === 'birdsong') {
    return (
      <svg
        viewBox="0 0 250 100"
        className="block h-auto w-full"
        role="img"
        aria-label="Birdsong Fonts: beautiful type for your next brand. A small songbird on a branch."
      >
        <rect width="250" height="100" fill="#f7f8fb" />
        <rect y="78" width="250" height="22" fill="#26375e" />
        <text
          x="14"
          y="40"
          fontFamily="Georgia,serif"
          fontStyle="italic"
          fontWeight="bold"
          fontSize="25"
          fill="#26375e"
        >
          Birdsong
        </text>
        <text x="16" y="58" fontFamily="Verdana,sans-serif" fontSize="9" letterSpacing="3" fill="#4a5c86">
          FONTS
        </text>
        <text x="14" y="93" fontFamily="Verdana,sans-serif" fontSize="8.5" fill="#e9eef8">
          Beautiful type for your next brand
        </text>
        <path
          d="M150 62 C 180 58, 215 60, 245 52"
          stroke="#6b4b2a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M222 56 l10 -8 m-18 10 l-4 -9" stroke="#6b4b2a" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="190" cy="44" rx="18" ry="13" fill="#e2a23b" />
        <circle cx="203" cy="34" r="9" fill="#e2a23b" />
        <path d="M211 33 l8 2 -8 3z" fill="#6b4b2a" />
        <circle cx="205" cy="32" r="1.6" fill="#26375e" />
        <path d="M176 42 C 186 36, 196 40, 198 50 C 190 52, 180 50, 176 42Z" fill="#c27c1c" />
        <path d="M172 46 L152 40 L156 50Z" fill="#c27c1c" />
        <path d="M186 57 l-2 6 M194 57 l1 6" stroke="#6b4b2a" strokeWidth="1.5" />
        <path d="M120 22 q6 -6 12 0 M128 14 q5 -5 10 0" stroke="#4a5c86" strokeWidth="1.3" fill="none" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 250 250"
      className="block h-auto w-full"
      role="img"
      aria-label="NavKit: menu builder with 120 styles. Stacked application windows showing menus."
    >
      <rect width="250" height="250" fill="#f3efe6" />
      <rect width="250" height="40" fill="#d26a3c" />
      <circle cx="22" cy="20" r="11" fill="#fff" />
      <path d="M16 16 h12 M16 20 h12 M16 24 h12" stroke="#d26a3c" strokeWidth="2" />
      <text x="40" y="27" fontFamily="Verdana,sans-serif" fontWeight="bold" fontSize="17" fill="#fff">
        NavKit
      </text>
      <text x="236" y="26" textAnchor="end" fontFamily="Verdana,sans-serif" fontSize="9" fill="#fff">
        menu builder
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${26 + i * 26} ${58 + i * 34})`}>
          <rect width="150" height="96" rx="4" fill="#000" opacity=".18" transform="translate(3 4)" />
          <rect width="150" height="96" rx="4" fill="#fff" stroke="#b9b098" />
          <rect width="150" height="14" rx="4" fill={['#5c5a3c', '#3f6fb5', '#7fa23a'][i]} />
          <circle cx="8" cy="7" r="2" fill="#fff" />
          <circle cx="15" cy="7" r="2" fill="#fff" opacity=".7" />
          {[0, 1, 2, 3].map((j) => (
            <rect
              key={j}
              x={10 + j * 34}
              y="22"
              width="28"
              height="8"
              rx="4"
              fill={j === i ? '#d26a3c' : '#e3ddcf'}
            />
          ))}
          <rect x="10" y="38" width="60" height="50" rx="3" fill="#f1ebdb" stroke="#d8d0bd" />
          {[0, 1, 2, 3].map((j) => (
            <rect key={j} x="16" y={44 + j * 11} width={40 - j * 5} height="5" rx="2.5" fill="#b9b098" />
          ))}
          <rect x="80" y="38" width="60" height="22" rx="3" fill="#e9e3d3" />
          <rect x="80" y="66" width="60" height="22" rx="3" fill="#e9e3d3" />
        </g>
      ))}
      <rect x="14" y="214" width="222" height="26" rx="13" fill="#5c5a3c" />
      <text
        x="125"
        y="231"
        textAnchor="middle"
        fontFamily="Verdana,sans-serif"
        fontWeight="bold"
        fontSize="11"
        fill="#fff"
      >
        120 styles · try it free
      </text>
    </svg>
  );
}

const LINKS: Record<Kind, string> = {
  packly: '/bundles/',
  birdsong: '/shop/?category=fonts',
  navkit: '/shop/?category=code',
};

export default function PromoBanner({ kind }: { kind: Kind }) {
  return (
    <figure className="m-0">
      <figcaption className="mb-0.5 text-right text-[9px] uppercase tracking-wider text-ink-muted">
        Advertise
      </figcaption>
      <Link
        href={LINKS[kind]}
        className="block overflow-hidden rounded-[3px] border border-[#8f8770] shadow-[0_1px_3px_rgba(0,0,0,.35)] transition hover:brightness-105"
      >
        <Art kind={kind} />
      </Link>
    </figure>
  );
}
