// Cheats category flow: empty state, nav/menu/sidebar/filter/dropdown entries, admin uploads a .dll into Cheats,
// it appears on /category/cheats/ and under the shop filter. No console errors, no horizontal overflow.
// BASE=http://127.0.0.1:8811/cheat-anal VW=320|768|1280 [SHOT=/path.png] node e2e/cheats-category.cjs
// Fixture: /tmp/aimcfg.dll (any small file).
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8811/cheat-anal';
const VW = Number(process.env.VW || 1280);
let passes = 0;
const ok = (c, m) => {
  if (c) passes++;
  console.log(`[${VW}] ` + (c ? 'PASS ' : 'FAIL ') + m);
  if (!c) process.exitCode = 1;
};
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: VW, height: 900 } });
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (m.type() === 'error') logs.push(p.url() + ' :: ' + m.text().slice(0, 160)); });
  p.on('pageerror', (e) => logs.push('pageerror ' + e.message));
  p.on('response', (r) => { if (r.status() >= 400) logs.push(`HTTP ${r.status()} ${r.url()}`); });
  let inflight = 0;
  p.on('request', () => inflight++);
  p.on('requestfinished', () => inflight--);
  p.on('requestfailed', () => inflight--);
  const go = async (path) => {
    await p.waitForLoadState('networkidle').catch(() => undefined);
    for (let i = 0; i < 40 && inflight > 0; i++) await p.waitForTimeout(100);
    await p.waitForTimeout(250);
    const r = await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    return r;
  };
  const noOverflow = async (label) => {
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(ov <= 0, `no horizontal overflow on ${label} (${ov}px)`);
  };

  // 1) empty state before any upload
  const r0 = await go('/category/cheats/');
  ok(r0.status() === 200, '/category/cheats/ is 200');
  ok((await p.locator('h1:has-text("Cheats")').count()) === 1, 'category H1 "Cheats"');
  ok((await p.locator('text=Configs, scripts and mods: dll, lua, cfg and more').count()) >= 1, 'category description shown');
  ok((await p.locator('[data-testid=category-empty]:has-text("No cheats yet — check back soon")').count()) === 1, 'friendly empty state');
  ok((await p.locator('main article').count()) === 0, 'no seeded cheats');
  await noOverflow('empty category page');

  // 2) nav entries: desktop bar, or the mobile menu at 320
  if (VW >= 768) {
    const nav = p.locator('nav[aria-label=Main]');
    const link = nav.locator('a[href$="/category/cheats/"]');
    ok((await link.count()) === 1 && (await link.innerText()).trim() === 'CHEATS', 'CHEATS in main nav');
    ok((await link.getAttribute('aria-current')) === 'page', 'CHEATS marked current on its page');
    const labels = (await nav.locator('ul > li > a').allInnerTexts()).map((t) => t.trim());
    ok(labels[labels.indexOf('SHOP') + 1] === 'CHEATS', 'CHEATS sits right after SHOP: ' + labels.join('|'));
    const navOv = await nav.evaluate((n) => n.scrollWidth - n.clientWidth);
    ok(navOv <= 0, `main nav does not overflow (${navOv}px)`);
  } else {
    ok(!(await p.locator('nav[aria-label=Main]').isVisible()), 'desktop nav hidden at 320');
    await p.click('button[aria-label="Open menu"]');
    const item = p.locator('#mobile-drawer a[href$="/category/cheats/"]');
    await item.waitFor({ timeout: 5000 });
    ok((await item.innerText()).trim().toUpperCase() === 'CHEATS', 'CHEATS in the mobile menu');
    await noOverflow('open mobile menu');
    await item.click();
    await p.waitForTimeout(400);
    ok(p.url().endsWith('/category/cheats/'), 'mobile menu link opens the category page');
  }

  // 3) sidebar icon grid
  const tile = p.locator('nav[aria-label=Categories] a[aria-label=Cheats]');
  ok((await tile.count()) === 1 && (await tile.getAttribute('href')).endsWith('/category/cheats/'), 'Cheats tile in sidebar grid');
  ok((await p.locator('nav[aria-label=Categories] li').count()) === 13, '13 sidebar category tiles');

  // 4) admin creates a product in Cheats with a .dll
  await go('/login/?next=/admin/');
  await p.fill('#login-email', 'admin@leafpress.local');
  await p.fill('#login-password', 'leafpress-admin');
  await p.click('main form button[type=submit]');
  await p.waitForURL('**/admin/', { timeout: 10000 });
  const form = p.locator('form[aria-label=Product]');
  await form.getByLabel('Category', { exact: true }).locator('option[value=cheats]').waitFor({ state: 'attached', timeout: 8000 });
  const opts = await form.getByLabel('Category', { exact: true }).locator('option').evaluateAll((o) => o.map((x) => [x.value, x.textContent]));
  ok(opts.some(([v, t]) => v === 'cheats' && t === 'Cheats'), 'admin category dropdown has Cheats');
  await form.getByLabel('Title', { exact: true }).fill('Aimtrainer Config Pack');
  await form.getByLabel('Description', { exact: true }).fill('Crosshair configs and a loader DLL for offline practice servers.');
  await form.getByLabel('Category', { exact: true }).selectOption('cheats');
  await form.getByLabel('Price (USD)', { exact: true }).fill('5');
  await form.getByLabel('Tags (comma separated)').fill('cfg, practice');
  await form.getByLabel(/Downloadable file/).setInputFiles('/tmp/aimcfg.dll');
  await p.waitForTimeout(200);
  await form.locator('button[type=submit]').click();
  await p.waitForSelector('[data-testid=admin-product]:has-text("Aimtrainer Config Pack")', { timeout: 15000 });
  ok((await p.locator('[data-testid=admin-product]:has-text("Aimtrainer Config Pack"):has-text("Cheats")').count()) === 1, 'saved product lists category Cheats');
  await noOverflow('admin');

  // author dashboard dropdown
  await go('/dashboard/');
  const dash = p.locator('select[id$="-category"]').first();
  await dash.waitFor({ timeout: 8000 }).catch(() => undefined);
  if (await dash.count()) {
    const dopts = await dash.locator('option').evaluateAll((o) => o.map((x) => x.value));
    ok(dopts.includes('cheats') && dopts.filter((v) => v).length === 13, 'dashboard category dropdown has 13 incl. Cheats');
  } else ok(false, 'dashboard category dropdown found');

  // 5) category page now lists it
  await go('/category/cheats/');
  await p.waitForSelector('main article:has-text("Aimtrainer Config Pack")', { timeout: 8000 });
  ok((await p.locator('main article').count()) === 1, 'category page shows the uploaded product');
  ok((await p.locator('[data-testid=category-empty]').count()) === 0, 'empty state gone');
  await noOverflow('category page with product');
  if (process.env.SHOT) {
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: process.env.SHOT, fullPage: false });
  }

  // 6) shop filter
  await go('/shop/?category=cheats');
  await p.waitForTimeout(400);
  ok((await p.locator('main article').count()) === 1 && (await p.locator('main article:has-text("Aimtrainer")').count()) === 1, 'shop ?category=cheats lists only it');
  ok((await p.locator('[aria-label="Active filters"] button:has-text("Cheats")').count()) === 1, 'Cheats filter chip');
  if (VW >= 1024) {
    const box = p.locator('aside fieldset:has(legend:has-text("Category")) label:has-text("Cheats") input, aside label:has-text("Cheats") input').first();
    ok(await box.isChecked(), 'sidebar filter Cheats checkbox checked');
    await box.uncheck();
    await p.waitForTimeout(400);
    await box.check();
    await p.waitForTimeout(400);
    ok((await p.locator('main article').count()) === 1, 'toggling the Cheats checkbox filters to it');
  } else {
    await p.click('button:has-text("Filters")');
    const box = p.locator('[role=dialog] label:has-text("Cheats") input');
    await box.waitFor({ timeout: 5000 });
    ok(await box.isChecked(), 'filter sheet has Cheats checked');
    await noOverflow('filter sheet');
    await p.keyboard.press('Escape');
  }
  await noOverflow('shop filtered');

  console.log(`[${VW}] ${passes} passed; console problems:`, logs.length ? logs : 'none');
  if (logs.length) process.exitCode = 1;
  await b.close();
})().catch((e) => { console.error('CRASH', e.message); process.exit(1); });
