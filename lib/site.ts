import { BASE_PATH } from './asset';

export const SITE = {
  name: 'Cheat & Anal',
  /** Short brand name for tight spots (PWA short_name, favicon). */
  shortName: 'C&A',
  tagline: 'Digital files, grown with care.',
  description:
    'Cheat & Anal is an independent marketplace for website templates, UI kits, fonts, icon packs, mockups, 3D assets, presets, ebooks and source code.',
  /** Absolute site root including the base path, e.g. https://tifo123lord.github.io/leafpress (no trailing slash). */
  url: `${(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cheat-anal.example').replace(/\/+$/, '')}${BASE_PATH}`,
};
