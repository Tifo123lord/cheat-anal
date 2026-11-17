// Brand check (Cheat & Anal): logo loads, H1/page titles use Rubik Glitch, no console errors, no horizontal overflow,
// at 320/768/1280 on home, shop, product, cart, admin, dashboard. BASE=http://127.0.0.1:8811/cheat-anal node e2e/brand-check.cjs
// Brand check for Cheat & Anal (cheat-anal repo) against a served static build.
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8811/cheat-anal';
const CHROME = process.env.CHROMIUM || undefined;
const PAGES = ['/', '/shop/', '/product/unavailable/', '/cart/', '/admin/', '/dashboard/'];
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL ' + m); } };
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  for (const vw of [320, 768, 1280]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: 900 } });
    const p = await ctx.newPage();
    // sign in as admin first so admin/dashboard render real content
    const errs = [];
    p.on('console', (m) => { if (m.type() === 'error') errs.push(p.url() + ' :: ' + m.text().slice(0, 160)); });
    p.on('pageerror', (e) => errs.push('pageerror ' + p.url() + ' ' + e.message));
    p.on('response', (r) => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`); });
    await p.goto(BASE + '/login/', { waitUntil: 'networkidle' });
    await p.fill('#login-email', 'admin@leafpress.local');
    await p.fill('#login-password', 'leafpress-admin');
    await p.press('#login-password', 'Enter');
    await p.waitForTimeout(1500);
    for (const path of PAGES) {
      const before = errs.length;
      await p.goto(BASE + path, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => {
        const logo = document.querySelector('header img[alt="Cheat & Anal"]');
        const heads = [...document.querySelectorAll('h1, .page-title, .brand-heading')].filter((h) => {
          const s = getComputedStyle(h); const rc = h.getBoundingClientRect();
          return rc.width > 2 && rc.height > 2 && s.visibility !== 'hidden' && !h.closest('.sr-only') && !h.classList.contains('sr-only');
        });
        const fonts = heads.map((h) => getComputedStyle(h).fontFamily);
        const glitchLoaded = document.fonts.check('16px "Rubik Glitch"') || [...document.fonts].some((f) => /Rubik|brand/i.test(f.family) && f.status === 'loaded');
        const lr = logo ? logo.getBoundingClientRect() : null;
        const over = [];
        const W = document.documentElement.clientWidth;
        for (const el of document.querySelectorAll('body *')) {
          const rc = el.getBoundingClientRect();
          if (rc.width && rc.right > W + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"]')) over.push(el.tagName + '.' + String(el.className).slice(0, 50) + ' r=' + Math.round(rc.right));
        }
        const bodyFont = getComputedStyle(document.querySelector('main p') || document.body).fontFamily;
        return {
          title: document.title, logo: !!logo, nw: logo ? logo.naturalWidth : 0, complete: logo ? logo.complete : false,
          logoBox: lr && [Math.round(lr.x), Math.round(lr.y), Math.round(lr.width), Math.round(lr.height)],
          headCount: heads.length, fonts: [...new Set(fonts)], glitchLoaded, bodyFont,
          scrollW: document.documentElement.scrollWidth, W, over: over.slice(0, 5),
        };
      });
      const tag = `[${vw}] ${path}`;
      ok(r.logo && r.complete && r.nw > 0, `${tag} logo naturalWidth=${r.nw}`);
      ok(r.headCount > 0, `${tag} no visible heading`);
      ok(r.fonts.length > 0 && r.fonts.every((f) => /^"?__brand_/.test(f)), `${tag} heading fonts ${r.fonts}`);
      ok(r.glitchLoaded, `${tag} Rubik Glitch not loaded`);
      ok(!/Rubik|__brand/i.test(r.bodyFont), `${tag} body font is brand ${r.bodyFont}`);
      ok(r.scrollW <= r.W, `${tag} horizontal overflow scrollW=${r.scrollW} W=${r.W} ${r.over.join(' | ')}`);
      ok(/Cheat & Anal/.test(r.title), `${tag} title ${r.title}`);
      ok(errs.length === before, `${tag} console errors: ${errs.slice(before).join(' || ')}`);
      console.log(`${tag} title="${r.title}" logo=${JSON.stringify(r.logoBox)} nw=${r.nw} heads=${r.headCount} fonts=${r.fonts.join(';')} scrollW=${r.scrollW}/${r.W}`);
    }
    await ctx.close();
  }
  // screenshots
  for (const [w, f] of [[1280, 'cheat-anal-home-desktop.png'], [390, 'cheat-anal-home-mobile.png']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, deviceScaleFactor: w > 500 ? 1 : 2 });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(800);
    await p.screenshot({ path: (process.env.SHOTS || '/tmp/') + f });
    await ctx.close();
  }
  await b.close();
  console.log(`RESULT passes=${passes} fails=${fails}`);
})();
