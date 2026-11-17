// Generates the seed data in /data (categories, authors, journal posts). Deterministic: re-running
// produces identical JSON. It writes zero products and zero bundles: the shop shows only admin uploads.
// Usage: node scripts/seed.mjs
import { writeFileSync } from 'node:fs';

const categories = [
  { id: 'templates', name: 'Website Templates', icon: 'browser', art: 'browser' },
  { id: 'ui-kits', name: 'UI Kits', icon: 'layers', art: 'uikit' },
  { id: 'fonts', name: 'Fonts', icon: 'type', art: 'type' },
  { id: 'icons', name: 'Icon Packs', icon: 'grid', art: 'icons' },
  { id: 'mockups', name: 'Mockups', icon: 'device', art: 'device' },
  { id: '3d', name: '3D Assets', icon: 'cube', art: 'shape3d' },
  { id: 'presets', name: 'Presets', icon: 'sliders', art: 'gradient' },
  { id: 'ebooks', name: 'Ebooks', icon: 'book', art: 'book' },
  { id: 'code', name: 'Source Code', icon: 'code', art: 'code' },
  { id: 'illustrations', name: 'Illustrations', icon: 'brush', art: 'illustration' },
  { id: 'textures', name: 'Textures', icon: 'texture', art: 'texture' },
  { id: 'motion', name: 'Motion', icon: 'play', art: 'motion' },
  {
    id: 'cheats',
    name: 'Cheats',
    description: 'Configs, scripts and mods: dll, lua, cfg and more',
    icon: 'crosshair',
    art: 'code',
  },
];

const authors = [
  [
    'fernhollow',
    'Fernhollow Studio',
    'A two-person studio in a converted greenhouse, making calm, well-organised templates.',
    'Bergen',
  ],
  ['mossy-pixel', 'Mossy Pixel', 'Pixel-tight icon sets and UI kits, hand-hinted at every size.', 'Lisbon'],
  ['juniper-ash', 'Juniper & Ash', 'Type designers who draw every curve on paper first.', 'Montreal'],
  [
    'quiet-oak',
    'Quiet Oak Supply',
    'Mockups and scenes photographed in nature, rebuilt as editable files.',
    'Kyoto',
  ],
  [
    'brightmeadow',
    'Brightmeadow',
    'Colour presets and gradients inspired by long summer evenings.',
    'Cape Town',
  ],
  ['sorrel-works', 'Sorrel Works', 'Clean source code starters with tests and docs included.', 'Tallinn'],
  ['thistle-co', 'Thistle & Co.', 'Illustrations and textures with a warm, inky hand.', 'Edinburgh'],
  ['larch-lane', 'Larch Lane', '3D props and motion loops for product storytelling.', 'Melbourne'],
].map(([id, name, bio, location], i) => ({
  id,
  name,
  avatarSeed: 11 + i * 37,
  bio,
  sales: 0,
  rating: 0,
  location,
  joined: `20${18 + (i % 6)}-0${1 + (i % 9)}-1${i}`,
}));

// The store starts empty: every file is uploaded by the admin (stored in the browser), so there are no
// seeded products or bundles, and author stats start at zero.
const products = [];
const bundles = [];

const posts = [
  [
    'how-we-review-files',
    'How we review every file before it goes live',
    'Three checks, two people and one cup of tea: our review process explained.',
    'fernhollow',
    '2026-11-10',
    'gradient:2',
  ],
  [
    'naming-layers',
    'Naming layers so future-you says thanks',
    'A small habit that makes templates far easier to customise.',
    'mossy-pixel',
    '2026-10-28',
    'uikit:4',
  ],
  [
    'pairing-fonts',
    'Pairing a rounded sans with a book serif',
    'Why soft headings and sturdy body text feel so friendly together.',
    'juniper-ash',
    '2026-10-14',
    'type:6',
  ],
  [
    'licenses-explained',
    'Personal, Commercial or Extended?',
    'A plain-language guide to picking the right licence for your project.',
    'sorrel-works',
    '2026-09-30',
    'book:1',
  ],
  [
    'mockups-that-sell',
    'Mockups that sell the idea, not the props',
    'Keeping scenes calm so the work stays the hero.',
    'quiet-oak',
    '2026-09-12',
    'device:3',
  ],
  [
    'greener-downloads',
    'Smaller files, greener downloads',
    'How compressing previews and code cut our transfer footprint by 40%.',
    'larch-lane',
    '2026-08-27',
    'shape3d:8',
  ],
].map(([slug, title, excerpt, authorId, date, art]) => ({
  slug,
  title,
  excerpt,
  authorId,
  date,
  art,
  body: [
    `${excerpt} At Cheat & Anal we think of every file as something that should keep growing after you download it, which is why the details matter so much to us and to our authors.`,
    'We start by opening the file exactly as a buyer would: on a fresh machine, with nothing else installed. If anything is missing, mislabelled or confusing, it goes back to the author with friendly notes and screenshots.',
    'Next we look at the small things: consistent naming, sensible defaults, clear licences and a read-me that explains where to begin. These are the details that save hours later.',
    'Finally, we ask whether the file is something we would happily use ourselves. If the answer is yes, it is published, and the author is notified the same day.',
  ],
}));

const w = (f, d) =>
  writeFileSync(new URL(`../data/${f}`, import.meta.url), JSON.stringify(d, null, 2) + '\n');
w('categories.json', categories);
w('authors.json', authors);
w('products.json', products);
w('bundles.json', bundles);
w('posts.json', posts);
console.log(
  `wrote ${products.length} products, ${bundles.length} bundles, ${authors.length} authors, ${categories.length} categories`,
);
