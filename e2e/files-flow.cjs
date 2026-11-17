// Any-file-type flow: admin uploads .dll/.lua/.cfg + GIF/SVG previews; a customer buys and downloads the .dll.
// Run against a served static build: BASE=http://127.0.0.1:8811/leafpress VW=320|768|1280 node e2e/files-flow.cjs
// Fixtures expected in /tmp: hookshot.dll, init.lua, server.cfg, anim.gif (animated), logo.svg, broken.png, too-big.bin (201 MB).
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:8811/leafpress';
const VW = Number(process.env.VW || 1280);
const ok = (c, m) => { console.log(`[${VW}] ` + (c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: VW, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(p.url() + ' :: ' + m.text().slice(0, 120)); });
  p.on('pageerror', (e) => logs.push('pageerror ' + e.message));
  p.on('dialog', (d) => { logs.push('dialog ' + d.message()); d.dismiss(); });
  // Settle in-flight RSC prefetches before a full navigation (aborting them logs a harmless Next.js error).
  let inflight = 0;
  p.on('request', () => inflight++);
  p.on('requestfinished', () => inflight--);
  p.on('requestfailed', () => inflight--);
  const go = async (path) => {
    await p.waitForLoadState('networkidle').catch(() => undefined);
    for (let i = 0; i < 40 && inflight > 0; i++) await p.waitForTimeout(100);
    await p.waitForTimeout(300);
    return p.goto(BASE + path, { waitUntil: 'networkidle' });
  };

  await go('/login/?next=/admin/');
  await p.fill('#login-email', 'admin@leafpress.local');
  await p.fill('#login-password', 'leafpress-admin');
  await p.click('main form button[type=submit]');
  await p.waitForURL('**/admin/', { timeout: 10000 });
  const form = p.locator('form[aria-label=Product]');
  const fileInput = form.getByLabel(/Downloadable file/);
  const chips = form.locator('[data-testid=type-chips] li');
  const chipTexts = async () => (await chips.allInnerTexts()).map((t) => t.replace(/×/g, '').trim());

  ok((await fileInput.getAttribute('accept')) === null, 'download input has no accept filter');
  ok((await form.getByLabel(/Preview images/).getAttribute('accept')) === 'image/*', 'image input accepts image/*');
  ok((await form.locator('text=storage quota').count()) >= 1, 'UI mentions browser storage quota');

  await fileInput.setInputFiles('/tmp/too-big.bin');
  await p.waitForTimeout(200);
  ok((await form.locator('.error-text:has-text("limit is 200.0 MB")').count()) === 1, '>200 MB file rejected inline');

  const fill = async (title, category = 'templates') => {
    await form.getByLabel('Title', { exact: true }).fill(title);
    await form.getByLabel('Description', { exact: true }).fill('Game mod files: a loader DLL, a Lua script and a server config.');
    await form.getByLabel('Category', { exact: true }).selectOption(category);
    await form.getByLabel('Price (USD)', { exact: true }).fill('7');
    await form.getByLabel('Tags (comma separated)').fill('mod, game');
  };

  // 1) .dll with an animated GIF, an SVG and one broken image
  await fill('Hookshot Mod Loader');
  await fileInput.setInputFiles('/tmp/hookshot.dll');
  await p.waitForTimeout(150);
  ok(JSON.stringify(await chipTexts()) === '["DLL"]', 'DLL chip auto-detected: ' + JSON.stringify(await chipTexts()));
  await form.getByLabel(/^File types/).fill('lua');
  await form.getByLabel(/^File types/).press('Enter');
  ok(JSON.stringify(await chipTexts()) === '["DLL","LUA"]', 'custom chip typed: ' + JSON.stringify(await chipTexts()));
  await form.getByLabel(/Preview images/).setInputFiles(['/tmp/anim.gif', '/tmp/broken.png', '/tmp/logo.svg']);
  await p.waitForSelector('[data-testid=image-errors]:has-text("broken.png")', { timeout: 8000 });
  await p.waitForFunction(() => document.querySelectorAll('ul[aria-label="Preview images"] li[data-kept]').length === 2, null, { timeout: 8000 });
  ok(true, 'broken image gets its own inline error, the other two are kept');
  const kept = await form.locator('li[data-kept]').evaluateAll((ls) => ls.map((l) => l.getAttribute('data-kept')));
  ok(JSON.stringify(kept) === '["original","original"]', 'GIF and SVG kept as originals: ' + kept);
  await form.locator('button[type=submit]').click();
  await p.waitForSelector('[data-testid=admin-product]:has-text("Hookshot Mod Loader")', { timeout: 15000 });

  // 2) .lua, no image -> default preview; 3) .cfg via a picked suggestion chip
  await fill('Lua Init Script');
  await fileInput.setInputFiles('/tmp/init.lua');
  await p.waitForTimeout(150);
  ok(JSON.stringify(await chipTexts()) === '["LUA"]', 'LUA chip auto-detected');
  ok((await form.locator('[data-testid=default-preview] img[src^="data:image/svg"]').count()) === 1, 'default preview when no image');
  await form.locator('button[type=submit]').click();
  await p.waitForSelector('[data-testid=admin-product]:has-text("Lua Init Script")', { timeout: 15000 });
  await fill('Server Config Pack');
  await fileInput.setInputFiles('/tmp/server.cfg');
  await p.waitForTimeout(150);
  await form.getByRole('button', { name: 'Add file type INI' }).click().catch(() => form.getByLabel(/^File types/).fill('ini'));
  await form.getByLabel(/^File types/).press('Enter');
  ok((await chipTexts()).includes('CFG'), 'CFG chip auto-detected: ' + JSON.stringify(await chipTexts()));
  await form.locator('button[type=submit]').click();
  await p.waitForSelector('[data-testid=admin-product]:has-text("Server Config Pack")', { timeout: 15000 });
  ok((await p.locator('[data-testid=admin-product]').count()) === 3, 'three products saved');

  // shop: dynamic file-type filter
  await go('/shop/?type=DLL');
  await p.waitForTimeout(500);
  ok((await p.locator('main article').count()) === 1 && (await p.locator('main article:has-text("Hookshot")').count()) === 1, 'shop ?type=DLL finds only the .dll product');
  if (VW >= 1024) {
    const side = p.locator('aside, main').locator('fieldset:has(legend:has-text("File type"))').first();
    const labels = (await side.locator('label').allInnerTexts()).map((t) => t.trim());
    ok(['DLL', 'LUA', 'CFG', 'PSD'].every((t) => labels.includes(t)), 'filter lists DLL, LUA, CFG next to seeded types');
    await side.locator('label:has-text("CFG")').click();
    await p.waitForTimeout(400);
    ok((await p.locator('main article').count()) === 2, 'DLL+CFG filter shows two products');
  }

  // product page: note, GIF original, SVG via <img> from blob
  await go('/shop/?q=hookshot');
  await p.waitForTimeout(400);
  await p.locator('main article:has-text("Hookshot") h3 a').first().click();
  await p.waitForURL('**/product/view/?id=adm-*');
  await p.waitForSelector('h1:has-text("Hookshot Mod Loader")');
  const note = await p.locator('[data-testid=file-note]').innerText();
  ok(/\.dll file · 19\.\d KB/.test(note), 'product page notes extension and size: ' + note);
  await p.waitForTimeout(800);
  const imgs = await p.locator('main img[src^="blob:"]').evaluateAll((is) => Promise.all(is.map(async (i) => {
    const blob = await (await fetch(i.src)).blob();
    return { type: blob.type, size: blob.size, w: i.naturalWidth };
  })));
  const gif = imgs.find((x) => x.type === 'image/gif');
  const svg = imgs.find((x) => x.type === 'image/svg+xml');
  ok(gif && gif.size === fs.statSync('/tmp/anim.gif').size && gif.w === 200, 'animated GIF served byte-for-byte: ' + JSON.stringify(gif));
  ok(svg && svg.w === 320, 'SVG rendered through <img> from a blob URL: ' + JSON.stringify(svg));
  ok((await p.locator('main svg script').count()) === 0, 'SVG never inlined');
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(ov <= 0, 'no horizontal overflow on product page');
  const productUrl = p.url();

  // customer buys and downloads the .dll
  await go('/account/');
  await p.click('button:has-text("Sign out")');
  await p.waitForTimeout(300);
  await go(productUrl.replace(BASE, ''));
  await p.waitForSelector('h1:has-text("Hookshot Mod Loader")');
  await p.click('main button:has-text("Add to cart")');
  await go('/register/?next=/checkout/');
  await p.fill('#reg-name', 'Rook Modder');
  await p.fill('#reg-email', 'rook@example.com');
  await p.fill('#reg-password', 'rook-mods-77');
  await p.fill('#reg-confirm', 'rook-mods-77');
  for (const cb of await p.locator('main form input[type=checkbox]').all()) await cb.check();
  await p.click('main form button[type=submit]');
  await p.waitForURL('**/checkout/', { timeout: 10000 });
  await p.fill('#co-card', '4242424242424242');
  await p.fill('#co-expiry', '1230');
  await p.fill('#co-cvc', '123');
  await p.check('#co-terms');
  await p.click('button[type=submit]:has-text("Pay")');
  await p.waitForURL('**/checkout/success/**', { timeout: 10000 });
  await go('/library/');
  await p.waitForSelector('text=Hookshot Mod Loader');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('main button:has-text("Download")').first().click()]);
  const got = fs.readFileSync(await dl.path());
  ok(dl.suggestedFilename() === 'hookshot.dll', 'download keeps original name: ' + dl.suggestedFilename());
  ok(Buffer.compare(got, fs.readFileSync('/tmp/hookshot.dll')) === 0, `downloaded .dll byte-identical (${got.length} B)`);

  console.log(`[${VW}] console problems:`, logs.length ? logs : 'none');
  if (logs.length) process.exitCode = 1;
  await b.close();
})().catch((e) => { console.error('CRASH', e.message); process.exit(1); });
