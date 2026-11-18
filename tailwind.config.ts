import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1100px',
    },
    extend: {
      colors: {
        night: 'var(--bg-night)',
        paper: { DEFAULT: 'var(--paper)', light: 'var(--paper-light)', dark: 'var(--paper-dark)' },
        olive: { DEFAULT: 'var(--olive)', dark: 'var(--olive-dark)' },
        leaf: { DEFAULT: 'var(--leaf)', dark: 'var(--leaf-dark)' },
        ink: { DEFAULT: 'var(--text-dark)', light: 'var(--text-light)', muted: 'var(--text-muted)' },
        link: 'var(--link)',
        sale: 'var(--sale)',
      },
      fontFamily: {
        // Latin glyphs use the original faces; Persian glyphs fall through to Vazirmatn (--font-fa).
        display: ['var(--font-display)', 'var(--font-fa)', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-fa)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'var(--font-fa)', 'Georgia', 'serif'],
        fa: ['var(--font-fa)', 'Tahoma', 'sans-serif'],
        brand: ['var(--font-brand)', 'Impact', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '930px' },
      boxShadow: {
        frame:
          '0 2px 0 rgba(255,255,255,.35) inset, 0 -1px 0 rgba(0,0,0,.12) inset, 0 6px 18px rgba(0,0,0,.55)',
        card: '0 1px 0 rgba(255,255,255,.5) inset, 0 3px 10px rgba(0,0,0,.45)',
        lift: '0 1px 0 rgba(255,255,255,.5) inset, 0 10px 22px rgba(0,0,0,.6)',
      },
    },
  },
  plugins: [],
};

export default config;
