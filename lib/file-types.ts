/**
 * Free-form file-type chips (DLL, CFG, LUA, PSD, …). Any extension is allowed; chips are just
 * normalised labels used on cards, the product page and the shop's "File type" filter.
 */
export const MAX_CHIPS = 12;
export const MAX_CHIP_LENGTH = 12;
/** Chip used when an uploaded file has no extension at all. */
export const NO_EXT_CHIP = 'FILE';

/** Lower-case extension of a file name without the dot ('' when there is none). */
export function extOf(name: string | undefined | null): string {
  if (!name) return '';
  const base = name.split(/[\\/]/).pop() ?? '';
  const dot = base.lastIndexOf('.');
  if (dot < 0 || dot === base.length - 1) return '';
  // ".env" style names: the part after the dot is the useful label.
  return base.slice(dot + 1).toLowerCase();
}

/** Normalise a typed or detected chip: no leading dots, upper case, safe characters only. */
export function normalizeChip(raw: string): string {
  return raw
    .trim()
    .replace(/^\.+/, '')
    .toUpperCase()
    .replace(/[^A-Z0-9_+\-.]/g, '')
    .replace(/\.+$/, '')
    .slice(0, MAX_CHIP_LENGTH);
}

/** The chip auto-detected from an uploaded file name: its extension in upper case (DLL, CFG, LUA). */
export function chipFromFileName(name: string): string {
  return normalizeChip(extOf(name)) || NO_EXT_CHIP;
}

/** Add chips (deduplicated, normalised, capped at MAX_CHIPS) keeping the existing order. */
export function addChips(list: string[], ...raw: string[]): string[] {
  const out = [...list];
  for (const r of raw) {
    const c = normalizeChip(r);
    if (c && !out.includes(c) && out.length < MAX_CHIPS) out.push(c);
  }
  return out;
}

/** Split typed text ("dll, .cfg lua") into chips. */
export const parseChips = (text: string): string[] => addChips([], ...text.split(/[\s,;]+/));

/** Every file type that exists across the given products, sorted, for dynamic filter lists. */
export function fileTypeOptions(items: { fileTypes: string[] }[], selected: string[] = []): string[] {
  const set = new Set<string>();
  items.forEach((p) => p.fileTypes.forEach((t) => set.add(t.toUpperCase())));
  selected.forEach((t) => set.add(t.toUpperCase()));
  return [...set].filter(Boolean).sort();
}
