import type { Product } from './types';

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
