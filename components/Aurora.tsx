import { seeded } from '@/lib/random';

/**
 * The night-sky header: aurora ribbons in teal, green, gold and violet with a soft glow and star specks.
 * A fixed 1600px canvas centred on the 930px content column, so the side swooshes always sit just
 * outside the content edges (x = 335 and x = 1265), as in a classic gallery layout.
 */
const stars = (() => {
  const r = seeded(42);
  return Array.from({ length: 70 }, () => ({
    x: Math.round(r() * 1600),
    y: Math.round(r() * 420),
    s: Math.round((0.5 + r() * 1.2) * 10) / 10,
    o: Math.round((0.3 + r() * 0.6) * 100) / 100,
  }));
})();

export default function Aurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden"
    >
      <svg
        className="absolute left-1/2 top-0 -translate-x-1/2"
        width="1600"
        height="760"
        viewBox="0 0 1600 760"
        role="presentation"
      >
        <defs>
          <radialGradient id="au-sky" cx="0.56" cy="0" r="0.75">
            <stop offset="0" stopColor="#1e3f86" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#14275a" stopOpacity="0.75" />
            <stop offset="1" stopColor="#0b0b0f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="au-violet" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#6b3fa0" stopOpacity="0.7" />
            <stop offset="1" stopColor="#6b3fa0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="au-teal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2bb3b1" stopOpacity="0" />
            <stop offset="0.25" stopColor="#43c7c0" stopOpacity="0.7" />
            <stop offset="0.6" stopColor="#8fe3e6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#3a7fd0" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="au-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9e36a" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#e0102a" stopOpacity="0.95" />
            <stop offset="0.8" stopColor="#3f6a24" stopOpacity="0.6" />
            <stop offset="1" stopColor="#3f6a24" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="au-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3d36b" stopOpacity="0" />
            <stop offset="0.25" stopColor="#f0c64e" stopOpacity="0.95" />
            <stop offset="0.65" stopColor="#c58f2a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#7a5216" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="au-crest" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#eafcff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="au-blur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="au-soft" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <rect width="1600" height="420" fill="url(#au-sky)" />
        <ellipse cx="560" cy="40" rx="360" ry="120" fill="url(#au-violet)" />
        <ellipse cx="1180" cy="10" rx="300" ry="90" fill="url(#au-violet)" opacity="0.6" />

        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
        ))}

        {/* teal ribbon sweeping across the top */}
        <path
          d="M0 120 C 260 40, 520 150, 820 70 S 1300 -10, 1600 60 L1600 0 L0 0 Z"
          fill="url(#au-teal)"
          opacity="0.55"
          filter="url(#au-blur)"
        />
        <path
          d="M180 128 C 420 60, 640 150, 900 84 S 1320 20, 1600 70"
          stroke="url(#au-teal)"
          strokeWidth="26"
          fill="none"
          opacity="0.55"
          filter="url(#au-soft)"
        />
        <path
          d="M520 118 C 700 70, 860 120, 1010 66 S 1250 22, 1420 46"
          stroke="url(#au-crest)"
          strokeWidth="3"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M640 140 C 820 96, 960 132, 1110 90 S 1330 50, 1500 70"
          stroke="url(#au-crest)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />

        {/* violet veil behind the logo */}
        <path
          d="M200 20 C 380 120, 520 30, 700 110 L700 0 L200 0Z"
          fill="#7a4fc0"
          opacity="0.25"
          filter="url(#au-blur)"
        />

        {/* green swoosh down the left edge of the content */}
        <path
          d="M420 96 C 330 130, 285 210, 300 330 C 308 410, 330 470, 336 560 C 318 470, 268 400, 262 300 C 256 200, 320 120, 420 96Z"
          fill="url(#au-green)"
        />
        <path
          d="M430 100 C 330 140, 296 220, 306 330"
          stroke="#eef6a0"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M380 110 C 300 170, 250 250, 270 380"
          stroke="#e0102a"
          strokeWidth="30"
          fill="none"
          opacity="0.35"
          filter="url(#au-blur)"
        />

        {/* gold swoosh down the right edge */}
        <path
          d="M1150 120 C 1280 140, 1330 240, 1300 360 C 1290 420, 1272 470, 1266 540 C 1300 470, 1350 400, 1352 300 C 1356 190, 1270 120, 1150 120Z"
          fill="url(#au-gold)"
        />
        <path
          d="M1200 128 C 1300 170, 1330 250, 1312 350"
          stroke="#ffe9a6"
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M1240 140 C 1320 210, 1350 300, 1320 420"
          stroke="#e0b040"
          strokeWidth="28"
          fill="none"
          opacity="0.3"
          filter="url(#au-blur)"
        />

        {/* green wave crest above the right end of the nav */}
        <path
          d="M900 132 C 1020 100, 1110 96, 1230 118 C 1150 112, 1050 118, 960 138Z"
          fill="#ff5a6c"
          opacity="0.75"
        />
        <path
          d="M760 136 C 860 116, 960 110, 1060 118"
          stroke="#d6ec7a"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
