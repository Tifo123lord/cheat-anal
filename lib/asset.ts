/**
 * Base path the site is served under (e.g. "/cheat-anal" on GitHub Pages, "" locally).
 * Inlined at build time from NEXT_PUBLIC_BASE_PATH; must match next.config.mjs.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/**
 * Prefix a root-relative path ("/feed.xml") with the base path.
 * next/link and router.push add basePath themselves; plain <a href>, <img> and metadata icons do not.
 * Absolute URLs, data:/blob: URLs and already-prefixed paths are returned unchanged.
 */
export function asset(p: string): string {
  if (!p || !p.startsWith('/') || p.startsWith('//')) return p;
  if (BASE_PATH && (p === BASE_PATH || p.startsWith(`${BASE_PATH}/`))) return p;
  return `${BASE_PATH}${p}`;
}
