import { seeded, hashString } from './random';
import type { Product, Review } from './types';

const NAMES = [
  'Mara L.',
  'Theo K.',
  'Ines P.',
  'Sam W.',
  'Noor A.',
  'Felix R.',
  'Ada M.',
  'Kian T.',
  'Lena V.',
  'Oskar B.',
];
const LINES = [
  'Beautifully organised, everything named exactly how I would have done it.',
  'Saved me a full weekend. The read-me alone is worth it.',
  'Lovely details. I wish there were a few more variations, but great value.',
  'Clean, consistent and easy to customise for a client project.',
  'Exactly as previewed. Support answered my question within a day.',
  'Good starting point, though I had to tweak some spacing.',
  'Gorgeous file. The colours are spot on.',
  'Works great, the update last month fixed my only issue.',
];

/** A few deterministic sample reviews whose ratings sit around the product average. */
export function seedReviews(product: Product): Review[] {
  if (product.votes === 0) return []; // new (admin-added) files start without reviews
  const r = seeded(hashString(product.id));
  const count = Math.min(4, Math.max(1, Math.round(product.votes / 40)));
  return Array.from({ length: count }, (_, i) => {
    const rating = Math.max(1, Math.min(5, Math.round(product.rating + (r() - 0.5) * 1.6)));
    const day = 1 + Math.floor(r() * 27);
    return {
      id: `${product.id}-seed-${i}`,
      productId: product.id,
      name: NAMES[Math.floor(r() * NAMES.length)],
      rating,
      text: LINES[Math.floor(r() * LINES.length)],
      date: `2026-${String(10 - (i % 3)).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  });
}

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export function changelog(product: Product): ChangelogEntry[] {
  const [maj, min, patch] = product.version.split('.').map(Number);
  const entries: ChangelogEntry[] = [
    {
      version: product.version,
      date: product.updatedAt,
      notes: ['Refined previews and file naming', 'Fixed small spacing issues reported by buyers'],
    },
  ];
  if (patch > 0 || min > 0) {
    entries.push({
      version: `${maj}.${Math.max(0, min - 1)}.0`,
      date: product.createdAt,
      notes: ['Added new variations', 'Improved documentation'],
    });
  }
  entries.push({ version: `${maj}.0.0`, date: product.createdAt, notes: ['Initial release'] });
  return entries;
}

export const PRODUCT_FAQ: { q: string; a: string }[] = [
  {
    q: 'Which licence do I need?',
    a: 'Personal covers your own non-commercial projects. Commercial covers one client or commercial project. Extended covers items you sell to many end users, such as templates or apps.',
  },
  {
    q: 'Do I get future updates?',
    a: 'Yes. Every purchase includes lifetime updates. New versions appear in your library automatically.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If a file is broken or not as described, we refund within 14 days. Just reach out through the Help Center.',
  },
  {
    q: 'How do downloads work?',
    a: 'After checkout your files appear in your library with a licence key. You can re-download any time.',
  },
];
