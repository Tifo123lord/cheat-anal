// Generates the seed catalogue in /data. Deterministic: re-running produces identical JSON.
// Usage: node scripts/seed.mjs
import { writeFileSync } from 'node:fs';

let s = 20260416;
const rnd = () => {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
};
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

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
  // No seeded files: its page shows an empty state until the admin uploads some.
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

const catAuthors = {
  templates: ['fernhollow', 'sorrel-works'],
  'ui-kits': ['mossy-pixel', 'fernhollow'],
  fonts: ['juniper-ash'],
  icons: ['mossy-pixel'],
  mockups: ['quiet-oak'],
  '3d': ['larch-lane'],
  presets: ['brightmeadow'],
  ebooks: ['juniper-ash', 'sorrel-works'],
  code: ['sorrel-works'],
  illustrations: ['thistle-co'],
  textures: ['thistle-co', 'brightmeadow'],
  motion: ['larch-lane'],
};

const names = {
  templates: [
    [
      'Canopy',
      'Agency Landing Template',
      'A bold, airy one-page site for small studios, with case-study grids and a smooth contact flow.',
    ],
    [
      'Seedling',
      'Startup Launch Template',
      'Pre-launch page with waitlist form, pricing table and changelog section.',
    ],
    [
      'Riverbank',
      'Portfolio Template',
      'A photographer-friendly portfolio with full-bleed galleries and a print shop page.',
    ],
  ],
  'ui-kits': [
    ['Petal', 'Dashboard UI Kit', '420 components and 60 screens for analytics dashboards, light and dark.'],
    ['Grove', 'Mobile App UI Kit', 'Onboarding, feeds, chat and checkout screens built on an 8pt grid.'],
    ['Nettle', 'E-commerce UI Kit', 'Product pages, carts and checkout flows with auto-layout everywhere.'],
  ],
  fonts: [
    [
      'Bramble Sans',
      'Humanist Font Family',
      'A friendly humanist sans in 9 weights with italics and 600+ glyphs.',
    ],
    ['Wren Serif', 'Display Serif', 'High-contrast display serif with ligatures and swash capitals.'],
    ['Pebble Round', 'Rounded Font', 'Soft rounded geometric for playful brands and children’s books.'],
  ],
  icons: [
    [
      'Leaflet',
      '1,200 Line Icons',
      'Consistent 1.5px stroke icons on a 24px grid, in SVG, icon font and Figma.',
    ],
    ['Acorn', 'Duotone Icon Set', 'Two-tone icons with editable colours for apps and marketing sites.'],
    ['Hedgerow', 'Nature Icon Pack', 'Plants, weather and outdoor icons drawn with a hand-made wobble.'],
  ],
  mockups: [
    [
      'Driftwood',
      'Device Mockup Scenes',
      'Laptop and phone scenes on natural wood, with smart-object screens.',
    ],
    ['Linen', 'Stationery Mockups', 'Business cards, letterheads and envelopes on soft linen.'],
    ['Clearwater', 'Packaging Mockups', 'Boxes, pouches and jars with realistic shadows and labels.'],
  ],
  '3d': [
    ['Pinecone', '3D Shape Pack', '80 soft-clay abstract shapes ready for hero sections.'],
    ['Burrow', 'Isometric Room Kit', 'Furniture and props to build cosy isometric scenes.'],
    ['Saplings', 'Low-poly Trees', '40 low-poly trees and rocks with four seasonal palettes.'],
  ],
  presets: [
    ['Golden Hour', 'Photo Presets', '24 warm film-like presets for desktop and mobile editors.'],
    ['Fern Shade', 'Moody Green Presets', 'Deep greens and soft blacks for forest and street photography.'],
    ['Aurora', 'Gradient Collection', '120 mesh gradients exported as SVG, PNG and swatches.'],
  ],
  ebooks: [
    [
      'Rooted',
      'Design Systems Ebook',
      'A practical guide to growing a design system that teams actually use.',
    ],
    ['The Quiet Grid', 'Layout Handbook', 'Grids, rhythm and whitespace explained with 200 diagrams.'],
    ['Plain Words', 'UX Writing Guide', 'Microcopy patterns, voice charts and 50 before/after examples.'],
  ],
  code: [
    ['Sprout', 'React Starter Kit', 'TypeScript, routing, auth screens, tests and CI, ready to fork.'],
    ['Trellis', 'Admin Template Code', 'Data tables, charts and role-based pages with clean, typed code.'],
    ['Compost', 'CSS Utility Library', 'A tiny utility layer with design tokens and dark-mode helpers.'],
  ],
  illustrations: [
    ['Wildflower', 'Illustration Set', '60 people-and-plants illustrations with swappable colours.'],
    ['Little Field', 'Spot Illustrations', 'Tiny spot art for empty states, errors and onboarding.'],
    ['Inkwood', 'Hand-drawn Doodles', '300 pen doodles: arrows, frames, leaves and underlines.'],
  ],
  textures: [
    ['Bark & Paper', 'Texture Pack', '50 high-resolution paper, card and bark textures.'],
    ['Riso Grain', 'Print Grain Overlays', 'Risograph-style grain and halftone overlays.'],
    ['Lichen', 'Organic Patterns', 'Seamless organic patterns in 12 earthy colourways.'],
  ],
  motion: [
    ['Breeze', 'Lottie Animation Pack', '40 lightweight loading and success animations.'],
    ['Ripple', 'Transition Presets', 'Smooth video transitions for editors and slideshows.'],
    ['Fireflies', 'Animated Backgrounds', 'Looping particle backgrounds in 4K and web formats.'],
  ],
};

const fileTypesFor = {
  templates: [
    ['HTML', 'CSS', 'ZIP'],
    ['HTML', 'FIG', 'ZIP'],
    ['HTML', 'PSD', 'ZIP'],
  ],
  'ui-kits': [
    ['FIG', 'SKETCH'],
    ['FIG', 'XD'],
    ['FIG', 'PSD'],
  ],
  fonts: [
    ['OTF', 'TTF', 'WOFF2'],
    ['OTF', 'WOFF2'],
    ['OTF', 'TTF'],
  ],
  icons: [
    ['SVG', 'FIG', 'PNG'],
    ['SVG', 'AI'],
    ['SVG', 'PNG', 'ZIP'],
  ],
  mockups: [
    ['PSD', 'ZIP'],
    ['PSD', 'FIG'],
    ['PSD', 'PNG'],
  ],
  '3d': [
    ['BLEND', 'OBJ', 'PNG'],
    ['BLEND', 'FBX'],
    ['OBJ', 'GLB'],
  ],
  presets: [
    ['XMP', 'DNG'],
    ['XMP', 'LUT'],
    ['SVG', 'PNG', 'ASE'],
  ],
  ebooks: [['PDF', 'EPUB'], ['PDF'], ['PDF', 'EPUB']],
  code: [
    ['ZIP', 'TS'],
    ['ZIP', 'TS'],
    ['ZIP', 'CSS'],
  ],
  illustrations: [
    ['SVG', 'AI', 'PNG'],
    ['SVG', 'PNG'],
    ['SVG', 'AI'],
  ],
  textures: [
    ['JPG', 'PNG'],
    ['PNG', 'PSD'],
    ['SVG', 'PNG'],
  ],
  motion: [
    ['JSON', 'AEP'],
    ['MOV', 'PRPROJ'],
    ['MP4', 'MOV'],
  ],
};

const compatFor = {
  templates: ['Any browser', 'Vanilla JS'],
  'ui-kits': ['Figma', 'Sketch'],
  fonts: ['macOS', 'Windows', 'Web'],
  icons: ['Figma', 'Illustrator', 'Web'],
  mockups: ['Photoshop', 'Figma'],
  '3d': ['Blender', 'Cinema 4D'],
  presets: ['Lightroom', 'Mobile editors'],
  ebooks: ['Any reader'],
  code: ['React', 'Node.js'],
  illustrations: ['Illustrator', 'Figma'],
  textures: ['Photoshop', 'Procreate'],
  motion: ['After Effects', 'Web'],
};

const tagsFor = {
  templates: ['landing', 'responsive', 'html', 'agency', 'portfolio'],
  'ui-kits': ['dashboard', 'mobile', 'components', 'figma', 'dark mode'],
  fonts: ['sans', 'serif', 'display', 'branding', 'variable'],
  icons: ['line', 'duotone', 'svg', 'nature', 'ui'],
  mockups: ['device', 'stationery', 'packaging', 'branding', 'scene'],
  '3d': ['3d', 'isometric', 'low poly', 'clay', 'hero'],
  presets: ['photo', 'film', 'warm', 'gradient', 'color'],
  ebooks: ['guide', 'design systems', 'layout', 'ux writing', 'learning'],
  code: ['react', 'typescript', 'starter', 'admin', 'css'],
  illustrations: ['people', 'spot', 'doodle', 'hand-drawn', 'onboarding'],
  textures: ['paper', 'grain', 'pattern', 'print', 'organic'],
  motion: ['lottie', 'animation', 'transitions', 'loop', 'video'],
};

const sizes = ['4.2 MB', '12.8 MB', '86 MB', '1.4 GB', '320 KB', '24.6 MB', '640 MB', '2.1 MB', '58 MB'];
const prices = [9, 12, 14, 16, 19, 24, 29, 32, 39, 45, 49, 59];
const freeSlots = new Set([5, 14, 22, 31]);

const products = [];
let n = 0;
for (const cat of categories) {
  (names[cat.id] ?? []).forEach(([name, kind, desc], i) => {
    n += 1;
    const isFree = freeSlots.has(n);
    const price = isFree ? 0 : pick(prices);
    const onSale = !isFree && n % 5 === 2;
    const salePrice = onSale ? Math.round(price * 0.7) - 0.01 + 0.01 : undefined;
    const created = new Date(Date.UTC(2026, 10, 12) - n * 4.3 * 86400000 - int(0, 3) * 86400000);
    const updated = new Date(created.getTime() + int(1, 40) * 86400000);
    const votes = int(1, 240);
    const rating = Math.round((3.1 + rnd() * 1.9) * 10) / 10;
    const sales = int(12, 4800);
    const badges = [];
    if (created > new Date(Date.UTC(2026, 9, 15))) badges.push('NEW');
    if (sales > 3700) badges.push('BESTSELLER');
    if (onSale) badges.push('SALE');
    if (isFree) badges.push('FREE');
    const authorId = catAuthors[cat.id][i % catAuthors[cat.id].length];
    const tags = [...tagsFor[cat.id]].sort(() => rnd() - 0.5).slice(0, 3);
    const licenses = isFree
      ? [
          { type: 'Personal', price: 0 },
          { type: 'Commercial', price: 9 },
        ]
      : [
          { type: 'Personal', price },
          { type: 'Commercial', price: Math.round(price * 2.5) },
          { type: 'Extended', price: price * 10 },
        ];
    const slug = `${name}-${kind}`
      .toLowerCase()
      .replace(/[’'&,.]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    products.push({
      id: `p${String(n).padStart(2, '0')}`,
      slug,
      title: `${name} — ${kind}`,
      description: `${desc} Organised layers, clear naming and a friendly read-me are included, so you can start in minutes. Every file is checked by the Cheat & Anal review team before it is published.`,
      price,
      ...(salePrice ? { salePrice: Math.round(price * 0.7) } : {}),
      category: cat.id,
      tags,
      fileTypes: fileTypesFor[cat.id][i],
      fileSize: pick(sizes),
      version: `${int(1, 3)}.${int(0, 9)}.${int(0, 4)}`,
      compatibility: compatFor[cat.id],
      licenses,
      images: [0, 1, 2].map((v) => `${cat.art}:${(n * 3 + v) % 12}`),
      authorId,
      rating,
      votes,
      sales,
      badges,
      createdAt: created.toISOString().slice(0, 10),
      updatedAt: updated.toISOString().slice(0, 10),
    });
  });
}

for (const a of authors) {
  const own = products.filter((p) => p.authorId === a.id);
  a.sales = own.reduce((t, p) => t + p.sales, 0);
  const votes = own.reduce((t, p) => t + p.votes, 0);
  a.rating = Math.round((own.reduce((t, p) => t + p.rating * p.votes, 0) / votes) * 10) / 10;
}

const bundles = [
  [
    'starter-garden',
    'Starter Garden',
    'Everything to launch a small studio site: a template, a UI kit, icons and a font.',
    ['p01', 'p04', 'p10', 'p07'],
    59,
  ],
  [
    'type-and-texture',
    'Type & Texture',
    'Three type families plus grain and paper textures for print-ready branding.',
    ['p07', 'p08', 'p09', 'p32', 'p33'],
    79,
  ],
  [
    'product-storytelling',
    'Product Storytelling',
    'Mockups, 3D shapes and motion loops for launch videos and decks.',
    ['p13', 'p15', 'p16', 'p34', 'p36'],
    89,
  ],
  [
    'developer-kit',
    'Developer Kit',
    'Typed starters, an admin template and a utility library with the layout handbook.',
    ['p25', 'p26', 'p27', 'p23'],
    69,
  ],
];

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
w(
  'bundles.json',
  bundles.map(([id, title, description, productIds, price]) => ({
    id,
    title,
    description,
    productIds,
    price,
  })),
);
w('posts.json', posts);
console.log(`wrote ${products.length} products, ${authors.length} authors, ${categories.length} categories`);
