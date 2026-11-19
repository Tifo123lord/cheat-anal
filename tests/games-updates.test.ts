import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { setExtraProducts, tagCloud } from '@/lib/catalog';
import {
  applyFilters,
  activeFilterCount,
  DEFAULT_FILTERS,
  filtersToQuery,
  parseFilters,
} from '@/lib/filters';
import { GAME_TAGS, GAMES, gameFor, gameHref, hasTag, productGames, toggleTag } from '@/lib/games';
import type { Product } from '@/lib/types';
import { latestUpdates, relativeFa, UPDATE_LABEL } from '@/lib/updates';
import CategoryPage from '@/app/category/[slug]/page';

const prod = (id: string, over: Partial<Product> = {}): Product =>
  ({
    id,
    slug: id,
    title: `Title ${id}`,
    description: '',
    price: 5,
    category: 'cheats',
    tags: [],
    fileTypes: ['DLL'],
    fileSize: '1 MB',
    version: '1.0.0',
    compatibility: [],
    licenses: [{ type: 'Personal', price: 5 }],
    images: ['gradient:0'],
    authorId: 'leafpress-studio',
    rating: 0,
    votes: 0,
    sales: 0,
    badges: [],
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
    ...over,
  }) as Product;

describe('game tags', () => {
  it('covers the requested games in Latin script with unique ids', () => {
    for (const g of ['CS2', 'Minecraft', 'MTA', 'FiveM', 'Rust', 'Valorant', 'GTA V', 'PUBG', 'Fortnite']) {
      expect(GAME_TAGS).toContain(g);
    }
    for (const g of ['Apex Legends', 'Call of Duty', 'Warzone', 'Roblox', 'DayZ', 'Escape from Tarkov']) {
      expect(GAME_TAGS).toContain(g);
    }
    expect(GAME_TAGS).toContain('Rainbow Six Siege');
    expect(GAME_TAGS).toContain('League of Legends');
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(GAMES.length);
    for (const t of GAME_TAGS) expect(t).toMatch(/^[\x20-\x7E]+$/);
  });

  it('matches names, ids and aliases case-insensitively', () => {
    expect(gameFor('cs2')?.name).toBe('CS2');
    expect(gameFor(' csgo ')?.id).toBe('cs2');
    expect(gameFor('GTA 5')?.id).toBe('gta-v');
    expect(gameFor('tarkov')?.name).toBe('Escape from Tarkov');
    expect(gameFor('aimbot')).toBeUndefined();
    expect(productGames(prod('a', { tags: ['FiveM', 'aimbot', 'fivem', 'Rust'] }))).toEqual([
      'fivem',
      'rust',
    ]);
    expect(gameHref('gta-v')).toBe('/shop/?game=gta-v');
  });

  it('toggles a suggested tag in the admin comma list', () => {
    expect(toggleTag('', 'CS2')).toBe('CS2');
    expect(toggleTag('aimbot, config', 'Rust')).toBe('aimbot, config, Rust');
    expect(toggleTag('aimbot, rust ,config', 'Rust')).toBe('aimbot, config');
    expect(hasTag('aimbot, cs2', 'CS2')).toBe(true);
    expect(hasTag('aimbot', 'CS2')).toBe(false);
  });

  it('filters the shop by game through ?game=', () => {
    const f = parseFilters(new URLSearchParams('game=cs2,FIVEM,nope,cs2'));
    expect(f.games).toEqual(['cs2', 'fivem']);
    expect(filtersToQuery({ ...DEFAULT_FILTERS, games: ['cs2'] })).toBe('game=cs2');
    expect(activeFilterCount({ ...DEFAULT_FILTERS, games: ['cs2', 'rust'] })).toBe(2);
    const items = [
      prod('a', { tags: ['CS:GO'] }),
      prod('b', { tags: ['Rust'] }),
      prod('c', { tags: ['misc'] }),
    ];
    expect(applyFilters(items, { ...DEFAULT_FILTERS, games: ['cs2'] }).map((p) => p.id)).toEqual(['a']);
    expect(applyFilters(items, { ...DEFAULT_FILTERS, games: ['cs2', 'rust'] }).map((p) => p.id)).toEqual([
      'a',
      'b',
    ]);
    expect(applyFilters(items, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it('lists every game in the tag cloud even before products use them, then counts uses', () => {
    setExtraProducts([], []);
    const empty = tagCloud();
    expect(empty.map((t) => t.tag)).toEqual([...GAME_TAGS]);
    expect(empty.every((t) => t.count === 0 && t.href.startsWith('/shop/?game='))).toBe(true);
    const p = prod('adm-x', { tags: ['CS2', 'config'] });
    setExtraProducts([p], [p]);
    const cloud = tagCloud();
    expect(cloud.find((t) => t.tag === 'CS2')?.count).toBe(1);
    expect(cloud.find((t) => t.tag === 'config')).toEqual({
      tag: 'config',
      count: 1,
      href: '/shop/?q=config',
    });
    setExtraProducts([], []);
  });

  it('suggests the game tags in the admin product form', () => {
    const src = readFileSync(new URL('../app/admin/ProductForm.tsx', import.meta.url), 'utf8');
    expect(src).toContain('GAME_TAGS.map');
    expect(src).toContain('toggleTag(t, g)');
  });

  it('shows a by-game structure on the Cheats category page only', () => {
    const cheats = renderToStaticMarkup(h(CategoryPage, { params: { slug: 'cheats' } }));
    expect(cheats).toContain('data-testid="cheat-games"');
    expect(cheats).toMatch(/href="\/shop\/?\?category=cheats&amp;game=minecraft"/);
    expect(renderToStaticMarkup(h(CategoryPage, { params: { slug: 'fonts' } }))).not.toContain('cheat-games');
  });
});

describe('latest updates', () => {
  const a = prod('a', { createdAt: '2026-11-10T10:00:00.000Z' });
  const b = prod('b', { createdAt: '2026-11-05T10:00:00.000Z' });
  const c = prod('c', { createdAt: '2026-11-12T10:00:00.000Z' });

  it('orders new files and file updates newest first, one per product', () => {
    const ev = latestUpdates([
      { product: a, fileUpdatedAt: '2026-11-10T10:00:01.000Z' },
      { product: b, fileUpdatedAt: '2026-11-15T09:00:00.000Z' },
      { product: c },
      { product: c, fileUpdatedAt: '2026-11-20T00:00:00.000Z' },
    ]);
    expect(ev.map((e) => [e.product.id, e.kind])).toEqual([
      ['b', 'updated'],
      ['c', 'new'],
      ['a', 'new'],
    ]);
    expect(ev[0].date).toBe('2026-11-15T09:00:00.000Z');
    expect(UPDATE_LABEL).toEqual({ new: 'فایل جدید', updated: 'به‌روزرسانی شد' });
  });

  it('caps the list (6 by default) and skips products without a valid date', () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      prod(`p${i}`, { createdAt: `2026-11-0${i + 1}T00:00:00.000Z` }),
    );
    const ev = latestUpdates([
      ...many.map((product) => ({ product })),
      { product: prod('z', { createdAt: 'x' }) },
    ]);
    expect(ev).toHaveLength(6);
    expect(ev[0].product.id).toBe('p8');
    expect(
      latestUpdates(
        many.map((product) => ({ product })),
        2,
      ),
    ).toHaveLength(2);
  });

  it('formats Persian relative times, then fa-IR dates after a week', () => {
    const now = Date.parse('2026-11-18T12:00:00.000Z');
    expect(relativeFa('2026-11-18T09:00:00.000Z', now)).toMatch(/ساعت پیش/);
    expect(relativeFa('2026-11-18T11:30:00.000Z', now)).toMatch(/دقیقه پیش/);
    expect(relativeFa('2026-11-17T12:00:00.000Z', now)).toBe('دیروز');
    expect(relativeFa('2026-11-01T12:00:00.000Z', now)).toMatch(/[۰-۹]/);
    expect(relativeFa('nope', now)).toBe('');
  });
});

describe('ads are gone', () => {
  it('no component or page references the old house ads', () => {
    const files = ['components/Sidebar.tsx', 'app/page.tsx', 'app/sell/page.tsx'];
    for (const f of files) {
      const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
      expect(src, f).not.toMatch(/PromoBanner|Packly|Birdsong|NavKit|advertise/);
    }
    const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
    expect(home).toContain('<LatestUpdates />');
    expect(home).toContain('آخرین به‌روزرسانی‌ها');
  });
});
