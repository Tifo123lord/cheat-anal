/**
 * Procedural product previews. Every image in the store is an SVG string built here,
 * then shown through next/image as a data URI (lazy-loaded, isolated ids, no network).
 * Families: browser frames, UI kits, type posters, icon sheets, device scenes, 3D shapes,
 * gradients, ebook covers, code editors, illustrations, textures and motion frames.
 */
import { seeded } from './random';
import type { ArtKind, Product } from './types';

const W = 320;
const H = 200;

interface Palette {
  bg: string;
  bg2: string;
  accent: string;
  accent2: string;
  ink: string;
  soft: string;
}

const PALETTES: Palette[] = [
  { bg: '#1f2a1c', bg2: '#33452a', accent: '#a8c75a', accent2: '#e7c46a', ink: '#f2efe2', soft: '#6f8a4a' },
  { bg: '#f1ebdb', bg2: '#e0d6bd', accent: '#5b7a1e', accent2: '#c2452d', ink: '#2b2a22', soft: '#b9b098' },
  { bg: '#102233', bg2: '#1d3c55', accent: '#5cc3c0', accent2: '#f0b856', ink: '#e8f1f2', soft: '#3b6a85' },
  { bg: '#2a1c2e', bg2: '#46304d', accent: '#d68fd0', accent2: '#8fd3a8', ink: '#f6ecf5', soft: '#7c5a84' },
  { bg: '#f6e8d8', bg2: '#ecd2b4', accent: '#d26a3c', accent2: '#3e6b5a', ink: '#33241a', soft: '#c9a27f' },
  { bg: '#e6efe4', bg2: '#cfe0cb', accent: '#2f7a4f', accent2: '#e2a23b', ink: '#1d2b22', soft: '#9dbb9f' },
  { bg: '#191919', bg2: '#2c2c2c', accent: '#f2c14e', accent2: '#ef6f4f', ink: '#f4f1ea', soft: '#555' },
  { bg: '#e9eef6', bg2: '#d3dcec', accent: '#3f5fb5', accent2: '#e46f8e', ink: '#1c2340', soft: '#9aa9cc' },
  { bg: '#30261a', bg2: '#4a3a26', accent: '#e0a458', accent2: '#9cc5a1', ink: '#f3e9d8', soft: '#7d6646' },
  { bg: '#0f2a2a', bg2: '#174242', accent: '#7fe0c6', accent2: '#ffd580', ink: '#e4f6f1', soft: '#2f6d68' },
  { bg: '#f3efe6', bg2: '#e2dccd', accent: '#7c4f9c', accent2: '#4f9c88', ink: '#262230', soft: '#bdb4c9' },
  { bg: '#3a1f1a', bg2: '#5a2f26', accent: '#ff8a5c', accent2: '#ffd3a1', ink: '#fbeee4', soft: '#8a4c3e' },
];

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const r1 = (n: number): string => (Math.round(n * 10) / 10).toString();

const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, extra = ''): string =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="${fill}"${extra}/>`;

const text = (x: number, y: number, s: string, size: number, fill: string, opts = ''): string =>
  `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" fill="${fill}" ${opts}>${esc(s)}</text>`;

const SANS = 'font-family="Verdana,Arial,sans-serif"';
const SERIF = 'font-family="Georgia,serif"';

function wrap(body: string, defs = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

function leafPath(cx: number, cy: number, s: number, rot: number, fill: string): string {
  return `<path transform="translate(${r1(cx)} ${r1(cy)}) rotate(${r1(rot)}) scale(${r1(s)})" d="M0 -10 C7 -6 7 6 0 10 C-7 6 -7 -6 0 -10Z" fill="${fill}"/>`;
}

/* ---------- families ---------- */

function browser(p: Palette, rnd: () => number, title: string): string {
  const heroW = 140 + rnd() * 40;
  let b = rect(0, 0, W, H, p.bg2);
  b += rect(14, 12, W - 28, H - 12, p.bg, 6);
  b += rect(14, 12, W - 28, 16, p.soft, 6) + rect(14, 22, W - 28, 6, p.soft);
  b += ['#e86a5c', '#e8c25c', '#7fc25c']
    .map((c, i) => `<circle cx="${24 + i * 8}" cy="20" r="2.5" fill="${c}"/>`)
    .join('');
  b += rect(60, 16, 150, 8, p.bg, 4, ' opacity=".6"');
  b += text(
    28,
    44,
    (title.split(' —')[0] ?? title).slice(0, 16).toLowerCase(),
    8,
    p.accent,
    `${SANS} font-weight="bold"`,
  );
  for (let i = 0; i < 4; i += 1) b += rect(170 + i * 30, 39, 22, 4, p.ink, 2, ' opacity=".5"');
  b += text(28, 76, title.split(' ')[0] ?? title, 22, p.ink, `${SERIF} font-weight="bold"`);
  b +=
    rect(28, 84, heroW - 20, 4, p.ink, 2, ' opacity=".55"') +
    rect(28, 92, heroW - 50, 4, p.ink, 2, ' opacity=".35"');
  b +=
    rect(28, 104, 54, 14, p.accent, 7) +
    rect(88, 104, 44, 14, 'none', 7, ` stroke="${p.ink}" stroke-opacity=".5"`);
  const hx = 28 + heroW;
  b += rect(hx, 52, W - 42 - hx, 72, p.accent2, 6, ' opacity=".9"');
  b += `<circle cx="${r1(hx + (W - 42 - hx) / 2)}" cy="88" r="20" fill="${p.bg}" opacity=".35"/>`;
  b += leafPath(hx + (W - 42 - hx) / 2, 88, 1.6, 25, p.accent);
  for (let i = 0; i < 3; i += 1) {
    const x = 28 + i * 90;
    b +=
      rect(x, 136, 80, 52, p.bg2, 4) +
      rect(x + 6, 142, 30, 4, p.accent, 2) +
      rect(x + 6, 152, 62, 3, p.ink, 1.5, ' opacity=".35"') +
      rect(x + 6, 159, 50, 3, p.ink, 1.5, ' opacity=".25"');
  }
  return b;
}

function uikit(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, p.bg);
  b += rect(12, 12, 96, 176, p.bg2, 8);
  for (let i = 0; i < 6; i += 1)
    b += rect(
      22,
      26 + i * 22,
      i === 1 ? 76 : 60,
      10,
      i === 1 ? p.accent : p.soft,
      5,
      i === 1 ? '' : ' opacity=".7"',
    );
  b += rect(118, 12, 190, 70, p.bg2, 8);
  const pts = Array.from({ length: 9 }, (_, i) => `${128 + i * 21},${70 - rnd() * 42}`).join(' ');
  b += `<polyline points="${pts}" fill="none" stroke="${p.accent}" stroke-width="2.5" stroke-linejoin="round"/>`;
  b +=
    rect(118, 92, 92, 44, p.accent, 8) +
    rect(126, 102, 40, 6, p.bg, 3) +
    rect(126, 114, 60, 10, p.bg, 3, ' opacity=".6"');
  b +=
    rect(216, 92, 92, 44, p.bg2, 8) +
    `<circle cx="240" cy="114" r="12" fill="none" stroke="${p.accent2}" stroke-width="5" stroke-dasharray="50 30"/>`;
  b += rect(258, 108, 40, 5, p.ink, 2, ' opacity=".4"') + rect(258, 118, 30, 5, p.ink, 2, ' opacity=".25"');
  b +=
    rect(118, 146, 58, 18, p.accent, 9) +
    rect(182, 146, 58, 18, 'none', 9, ` stroke="${p.accent}" stroke-width="1.5"`);
  b += rect(250, 149, 30, 12, p.accent2, 6) + `<circle cx="274" cy="155" r="5" fill="${p.bg}"/>`;
  b += rect(118, 172, 190, 14, p.bg2, 7) + rect(118, 172, 120, 14, p.soft, 7, ' opacity=".6"');
  return b;
}

function type(p: Palette, rnd: () => number, title: string): string {
  const name = title.split(' —')[0] ?? title;
  const serif = rnd() > 0.5;
  const fam = serif ? SERIF : SANS;
  let b = rect(0, 0, W, H, p.bg);
  b += `<circle cx="${r1(230 + rnd() * 40)}" cy="${r1(60 + rnd() * 40)}" r="70" fill="${p.accent2}" opacity=".25"/>`;
  b += text(18, 118, 'Aa', 110, p.accent, `${fam} font-weight="bold" letter-spacing="-4"`);
  b += text(190, 60, name.slice(0, 14), 15, p.ink, `${fam} font-weight="bold"`);
  b += text(190, 78, serif ? 'Display · 6 styles' : '9 weights · italics', 8, p.ink, `${SANS} opacity=".7"`);
  b += text(18, 152, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 11.5, p.ink, `${fam} letter-spacing="1.3"`);
  b += text(18, 170, 'abcdefghijklmnopqrstuvwxyz 0123456789', 10.5, p.ink, `${fam} opacity=".75"`);
  b += rect(18, 182, 284, 1, p.ink, 0, ' opacity=".3"');
  b += text(190, 104, 'The quick fox', 13, p.accent2, `${fam} font-style="italic"`);
  return b;
}

const GLYPHS: ((x: number, y: number, c: string) => string)[] = [
  (x, y, c) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  (x, y, c) => leafPath(x, y, 0.8, 30, c),
  (x, y, c) =>
    `<path d="M${x - 7} ${y + 6} L${x} ${y - 7} L${x + 7} ${y + 6}Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  (x, y, c) =>
    `<path d="M${x - 7} ${y} L${x} ${y - 7} L${x + 7} ${y} V${y + 7} H${x - 7}Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  (x, y, c) =>
    `<path d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y - 2} L${x + 3} ${y + 2} L${x + 4} ${y + 7} L${x} ${y + 4} L${x - 4} ${y + 7} L${x - 3} ${y + 2} L${x - 7} ${y - 2} L${x - 2} ${y - 2}Z" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`,
  (x, y, c) =>
    `<rect x="${x - 7}" y="${y - 5}" width="14" height="10" rx="2" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M${x - 7} ${y - 4} L${x} ${y + 1} L${x + 7} ${y - 4}" fill="none" stroke="${c}" stroke-width="1.5"/>`,
  (x, y, c) =>
    `<path d="M${x - 6} ${y + 2} a4 4 0 0 1 4-6 a5 5 0 0 1 9 1 a3.5 3.5 0 0 1 0 7 h-12 a3 3 0 0 1-1-2z" fill="none" stroke="${c}" stroke-width="1.6"/>`,
  (x, y, c) =>
    `<path d="M${x} ${y + 7} C${x - 9} ${y} ${x - 6} ${y - 8} ${x} ${y - 3} C${x + 6} ${y - 8} ${x + 9} ${y} ${x} ${y + 7}Z" fill="none" stroke="${c}" stroke-width="1.7"/>`,
  (x, y, c) =>
    `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/><path d="M${x} ${y - 9}v3M${x} ${y + 6}v3M${x - 9} ${y}h3M${x + 6} ${y}h3" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
  (x, y, c) =>
    `<path d="M${x - 6} ${y - 6} h12 v12 h-12z M${x - 6} ${y} h12 M${x} ${y - 6} v12" fill="none" stroke="${c}" stroke-width="1.6"/>`,
];

function icons(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, p.bg);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const x = 32 + col * 43;
      const y = 32 + row * 45;
      const hi = rnd() > 0.82;
      b += rect(x - 16, y - 16, 32, 32, hi ? p.accent : p.bg2, 8, hi ? '' : ' opacity=".8"');
      b += GLYPHS[Math.floor(rnd() * GLYPHS.length)](x, y, hi ? p.bg : p.ink);
    }
  }
  return b;
}

function device(p: Palette, rnd: () => number, title: string): string {
  let b = rect(0, 0, W, H, p.bg2);
  for (let i = 0; i < 7; i += 1) b += rect(0, 20 + i * 26 + rnd() * 6, W, 1.2, p.soft, 0, ' opacity=".35"');
  b += `<ellipse cx="150" cy="176" rx="120" ry="8" fill="#000" opacity=".25"/>`;
  b += rect(60, 40, 180, 116, '#1d1d1f', 8) + rect(68, 48, 164, 100, p.bg, 2);
  b += rect(68, 48, 164, 100, 'url(#g)', 2);
  b += text(80, 92, (title.split(' ')[0] ?? '').slice(0, 10), 18, p.ink, `${SERIF} font-weight="bold"`);
  b += rect(80, 100, 90, 4, p.ink, 2, ' opacity=".5"') + rect(80, 110, 50, 12, p.accent, 6);
  b += `<path d="M40 156 H260 L270 168 H30Z" fill="#c9c6bd"/>` + rect(130, 156, 40, 4, '#a5a29a', 2);
  b += rect(236, 82, 52, 96, '#1d1d1f', 9) + rect(240, 88, 44, 84, p.accent2, 5);
  b +=
    rect(246, 98, 30, 5, p.bg, 2) +
    rect(246, 108, 22, 4, p.bg, 2, ' opacity=".6"') +
    `<circle cx="262" cy="140" r="12" fill="${p.bg}" opacity=".5"/>`;
  b += leafPath(30, 60, 2.2, -30, p.accent) + leafPath(44, 48, 1.6, 20, p.soft);
  return b;
}

function shape3d(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, 'url(#bgg)');
  const n = 4 + Math.floor(rnd() * 2);
  for (let i = 0; i < n; i += 1) {
    const x = 40 + rnd() * 240;
    const y = 40 + rnd() * 120;
    const r = 18 + rnd() * 30;
    b += `<ellipse cx="${r1(x + 6)}" cy="${r1(y + r + 4)}" rx="${r1(r * 0.9)}" ry="${r1(r * 0.18)}" fill="#000" opacity=".2"/>`;
    b +=
      i % 2
        ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="url(#s${i % 3})"/>`
        : `<rect x="${r1(x - r * 0.8)}" y="${r1(y - r * 0.8)}" width="${r1(r * 1.6)}" height="${r1(r * 1.6)}" rx="${r1(r * 0.35)}" fill="url(#s${i % 3})" transform="rotate(${r1(rnd() * 40 - 20)} ${r1(x)} ${r1(y)})"/>`;
  }
  b += `<circle cx="250" cy="60" r="26" fill="none" stroke="url(#s1)" stroke-width="12"/>`;
  return b;
}

function shape3dDefs(p: Palette): string {
  const sph = (id: string, c: string) =>
    `<radialGradient id="${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`;
  return `<linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient>${sph('s0', p.accent)}${sph('s1', p.accent2)}${sph('s2', p.soft)}`;
}

function gradient(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, p.bg);
  const cs = [p.accent, p.accent2, p.soft, p.bg2, p.accent];
  cs.forEach((c, i) => {
    b += `<circle cx="${r1(rnd() * W)}" cy="${r1(rnd() * H)}" r="${r1(70 + rnd() * 70)}" fill="${c}" opacity=".75" filter="url(#blur)"/>`;
    if (i === 2)
      b += `<path d="M0 ${r1(120 + rnd() * 40)} C 90 ${r1(60 + rnd() * 50)}, 200 ${r1(190 + rnd() * 20)}, 320 ${r1(90 + rnd() * 40)} V200 H0Z" fill="${p.bg2}" opacity=".35" filter="url(#blur2)"/>`;
  });
  b +=
    rect(16, 160, 120, 24, '#000', 12, ' opacity=".25"') + text(28, 176, 'mesh · 4K · svg', 9, '#fff', SANS);
  return b;
}

function book(p: Palette, rnd: () => number, title: string): string {
  const name = title.split(' —')[0] ?? title;
  let b = rect(0, 0, W, H, p.bg2);
  b += `<ellipse cx="160" cy="186" rx="80" ry="8" fill="#000" opacity=".25"/>`;
  b += rect(108, 18, 104, 166, '#000', 3, ' opacity=".25" transform="translate(5 3)"');
  b += rect(108, 18, 104, 166, p.accent, 3) + rect(108, 18, 8, 166, '#000', 0, ' opacity=".18"');
  b += text(124, 54, name.slice(0, 12), name.length > 9 ? 11 : 15, p.bg, `${SERIF} font-weight="bold"`);
  b += rect(124, 62, 50, 2, p.bg, 1, ' opacity=".8"');
  b +=
    `<circle cx="160" cy="118" r="${r1(22 + rnd() * 6)}" fill="${p.accent2}"/>` +
    leafPath(160, 118, 2, 20, p.bg);
  b += text(124, 172, 'Cheat & Anal books', 7, p.bg, `${SANS} opacity=".85"`);
  b +=
    rect(30, 40, 60, 80, p.bg, 3, ' opacity=".6" transform="rotate(-8 60 80)"') +
    rect(232, 52, 60, 80, p.bg, 3, ' opacity=".5" transform="rotate(7 262 92)"');
  return b;
}

function code(p: Palette, rnd: () => number): string {
  const ed = '#16181d';
  let b = rect(0, 0, W, H, p.bg2);
  b += rect(14, 14, 292, 172, ed, 6) + rect(14, 14, 292, 16, '#23262e', 6) + rect(14, 24, 292, 6, '#23262e');
  b += ['#e86a5c', '#e8c25c', '#7fc25c']
    .map((c, i) => `<circle cx="${26 + i * 9}" cy="22" r="3" fill="${c}"/>`)
    .join('');
  b +=
    rect(14, 30, 58, 156, '#1c1f25') +
    [0, 1, 2, 3, 4, 5].map((i) => rect(22, 40 + i * 14, 30 + (i % 3) * 8, 4, '#5a6170', 2)).join('');
  const cols = [p.accent, p.accent2, '#9aa4b8', '#d78ad1', '#7fc2e0'];
  for (let i = 0; i < 11; i += 1) {
    b += text(80, 44 + i * 13, String(i + 1), 7, '#4b5160', 'font-family="monospace"');
    let x = 94 + (i % 4 === 0 ? 0 : 12 * (1 + (i % 3)));
    const n = 2 + Math.floor(rnd() * 3);
    for (let j = 0; j < n; j += 1) {
      const w = 14 + rnd() * 46;
      if (x + w > 296) break;
      b += rect(x, 39 + i * 13, w, 5, cols[(i + j) % cols.length], 2.5);
      x += w + 6;
    }
  }
  return b;
}

function illustration(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, p.bg);
  b += `<circle cx="${r1(220 + rnd() * 40)}" cy="60" r="34" fill="${p.accent2}" opacity=".8"/>`;
  b += `<path d="M0 150 C 80 120, 160 170, 320 135 V200 H0Z" fill="${p.soft}" opacity=".7"/>`;
  b += `<path d="M0 170 C 100 150, 200 190, 320 160 V200 H0Z" fill="${p.accent}" opacity=".8"/>`;
  for (let i = 0; i < 6; i += 1) {
    const x = 30 + i * 52 + rnd() * 10;
    const h = 40 + rnd() * 40;
    b += `<path d="M${r1(x)} 170 C ${r1(x - 4)} ${r1(170 - h / 2)}, ${r1(x + 6)} ${r1(170 - h)}, ${r1(x)} ${r1(170 - h)}" stroke="${p.ink}" stroke-width="1.6" fill="none"/>`;
    b += leafPath(x - 7, 170 - h * 0.6, 1, -45, p.accent) + leafPath(x + 7, 170 - h * 0.8, 0.9, 45, p.soft);
  }
  b += `<circle cx="140" cy="84" r="12" fill="${p.ink}"/><path d="M122 140 C 124 108, 156 108, 158 140Z" fill="${p.accent2}"/>`;
  b +=
    `<path d="M150 112 L178 96" stroke="${p.ink}" stroke-width="5" stroke-linecap="round"/>` +
    leafPath(184, 92, 1.3, 60, p.accent);
  return b;
}

function texture(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, p.bg2);
  const style = Math.floor(rnd() * 3);
  for (let i = 0; i < 220; i += 1) {
    const x = rnd() * W;
    const y = rnd() * H;
    if (style === 0)
      b += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(0.6 + rnd() * 2.2)}" fill="${p.ink}" opacity="${r1(0.08 + rnd() * 0.25)}"/>`;
    else if (style === 1)
      b += rect(x, y, 8 + rnd() * 30, 1, p.ink, 0, ` opacity="${r1(0.08 + rnd() * 0.2)}"`);
    else if (i < 70) b += leafPath(x, y, 0.5 + rnd() * 0.9, rnd() * 360, i % 2 ? p.accent : p.soft);
  }
  b += rect(16, 16, 96, 26, p.bg, 4, ' opacity=".85"') + text(24, 33, 'seamless · 6K', 9, p.ink, SANS);
  return b;
}

function motion(p: Palette, rnd: () => number): string {
  let b = rect(0, 0, W, H, p.bg);
  for (let i = 0; i < 5; i += 1) {
    const x = 60 + i * 34;
    b += `<circle cx="${x}" cy="${r1(84 + Math.sin(i + rnd()) * 16)}" r="${10 + i * 3}" fill="${p.accent}" opacity="${r1(0.15 + i * 0.17)}"/>`;
  }
  b += `<circle cx="250" cy="84" r="26" fill="${p.accent2}"/><path d="M243 72 L262 84 L243 96Z" fill="${p.bg}"/>`;
  b += rect(20, 150, 280, 30, p.bg2, 6);
  for (let i = 0; i < 4; i += 1)
    b += rect(28 + i * 68, 156, 60, 18, i === 1 ? p.accent : p.soft, 3, ' opacity=".8"');
  b += rect(120, 146, 2, 38, p.accent2);
  return b;
}

/* ---------- public API ---------- */

export interface ArtSpec {
  kind: ArtKind;
  variant: number;
}

const KINDS: ArtKind[] = [
  'browser',
  'uikit',
  'type',
  'icons',
  'device',
  'shape3d',
  'gradient',
  'book',
  'code',
  'illustration',
  'texture',
  'motion',
];

export function parseArt(descriptor: string): ArtSpec {
  const [k, v] = descriptor.split(':');
  const kind = (KINDS as string[]).includes(k) ? (k as ArtKind) : 'gradient';
  const variant = Number.isFinite(Number(v)) ? Math.abs(Math.floor(Number(v))) : 0;
  return { kind, variant };
}

export function artSvg(descriptor: string, title = 'Cheat & Anal'): string {
  const { kind, variant } = parseArt(descriptor);
  const p = PALETTES[variant % PALETTES.length];
  const rnd = seeded(variant * 7919 + kind.length * 104729 + title.length);
  const screen = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.accent}" stop-opacity=".35"/><stop offset="1" stop-color="${p.accent2}" stop-opacity=".2"/></linearGradient>`;
  switch (kind) {
    case 'browser':
      return wrap(browser(p, rnd, title));
    case 'uikit':
      return wrap(uikit(p, rnd));
    case 'type':
      return wrap(type(p, rnd, title));
    case 'icons':
      return wrap(icons(p, rnd));
    case 'device':
      return wrap(device(p, rnd, title), screen);
    case 'shape3d':
      return wrap(shape3d(p, rnd), shape3dDefs(p));
    case 'gradient':
      return wrap(
        gradient(p, rnd),
        '<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter><filter id="blur2"><feGaussianBlur stdDeviation="8"/></filter>',
      );
    case 'book':
      return wrap(book(p, rnd, title));
    case 'code':
      return wrap(code(p, rnd));
    case 'illustration':
      return wrap(illustration(p, rnd));
    case 'texture':
      return wrap(texture(p, rnd));
    case 'motion':
    default:
      return wrap(motion(p, rnd));
  }
}

const DARK = new Set([0, 2, 3, 6, 8, 9, 11]);

/** Index of the first preview with a night palette (the slider reads best on dark art). */
export function darkImageIndex(product: Pick<Product, 'images'>): number {
  const i = product.images.findIndex((d) => DARK.has(parseArt(d).variant % PALETTES.length));
  return i < 0 ? 0 : i;
}

export const svgDataUri = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export function productImage(product: Pick<Product, 'images' | 'title'>, index = 0): string {
  const d = product.images[index] ?? product.images[0] ?? 'gradient:0';
  return svgDataUri(artSvg(d, product.title));
}

/** Simple generated avatar: a leaf on a tinted disc. */
export function avatarSvg(seed: number, initials: string): string {
  const p = PALETTES[seed % PALETTES.length];
  const rot = (seed * 47) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="${p.accent}"/><path transform="translate(30 10) rotate(${rot}) scale(.9)" d="M0 -10 C7 -6 7 6 0 10 C-7 6 -7 -6 0 -10Z" fill="${p.accent2}" opacity=".7"/><text x="20" y="25" text-anchor="middle" font-size="13" font-family="Verdana,Arial,sans-serif" font-weight="bold" fill="${p.bg}">${esc(initials)}</text></svg>`;
}
