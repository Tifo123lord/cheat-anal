import type { Product } from './types';

/** A game a cheat/config/mod is for. Names stay in Latin script; `aliases` also match product tags. */
export interface Game {
  id: string;
  name: string;
  aliases?: string[];
}

/** Games offered as tags for cheats (category «چیت‌ها»), suggested in the admin form and browsable in the shop. */
export const GAMES: readonly Game[] = [
  { id: 'cs2', name: 'CS2', aliases: ['Counter-Strike 2', 'CS:GO', 'CSGO', 'Counter-Strike'] },
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'mta', name: 'MTA', aliases: ['MTA:SA', 'Multi Theft Auto'] },
  { id: 'fivem', name: 'FiveM' },
  { id: 'rust', name: 'Rust' },
  { id: 'valorant', name: 'Valorant' },
  { id: 'gta-v', name: 'GTA V', aliases: ['GTA 5', 'GTA5', 'GTAV', 'Grand Theft Auto V'] },
  { id: 'pubg', name: 'PUBG', aliases: ['PUBG Mobile'] },
  { id: 'fortnite', name: 'Fortnite' },
  { id: 'apex-legends', name: 'Apex Legends', aliases: ['Apex'] },
  { id: 'call-of-duty', name: 'Call of Duty', aliases: ['COD'] },
  { id: 'warzone', name: 'Warzone', aliases: ['COD Warzone'] },
  { id: 'roblox', name: 'Roblox' },
  { id: 'dayz', name: 'DayZ' },
  { id: 'tarkov', name: 'Escape from Tarkov', aliases: ['Tarkov', 'EFT'] },
  { id: 'r6-siege', name: 'Rainbow Six Siege', aliases: ['R6', 'R6S', 'Rainbow Six'] },
  { id: 'lol', name: 'League of Legends', aliases: ['LoL'] },
];

/** The tag names admins pick from (Latin script). */
export const GAME_TAGS: readonly string[] = GAMES.map((g) => g.name);

const norm = (s: string): string => s.trim().toLowerCase();
const byKey = new Map<string, Game>();
for (const g of GAMES) for (const k of [g.id, g.name, ...(g.aliases ?? [])]) byKey.set(norm(k), g);

/** The game a tag (or game id) names, matching names, ids and aliases case-insensitively. */
export const gameFor = (tagOrId: string): Game | undefined => byKey.get(norm(tagOrId));

export const getGame = (id: string): Game | undefined => GAMES.find((g) => g.id === id);

/** Game ids a product is tagged with. */
export const productGames = (p: Pick<Product, 'tags'>): string[] => [
  ...new Set(p.tags.map((t) => gameFor(t)?.id).filter((x): x is string => Boolean(x))),
];

/** Shop link that filters by one game. */
export const gameHref = (id: string): string => `/shop/?game=${encodeURIComponent(id)}`;

/** Adds a tag to a comma-separated tag list, or removes it when present (case-insensitive). */
export function toggleTag(list: string, tag: string): string {
  const parts = list
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const has = parts.some((t) => norm(t) === norm(tag));
  const next = has ? parts.filter((t) => norm(t) !== norm(tag)) : [...parts, tag];
  return next.join(', ');
}

/** True when a comma-separated tag list already holds the tag (case-insensitive). */
export const hasTag = (list: string, tag: string): boolean =>
  list.split(',').some((t) => norm(t) === norm(tag));
