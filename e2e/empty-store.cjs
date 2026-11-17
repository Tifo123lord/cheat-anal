// Empty store: no seeded files. Checks empty states, console errors and overflow at the given width, then
// (at 1280) an admin uploads a .dll that the demo user buys and downloads byte-for-byte.
// Run against a served static build: BASE=http://127.0.0.1:8811/cheat-anal VW=320|1280 node e2e/empty-store.cjs
// Fixture expected: /tmp/hookshot.dll. SHOT=<path> saves a 1280 screenshot of the empty home page.
const { chromium } = require(process.env.PW_CORE || 'playwright-core');
const fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:8811/cheat-anal';
const VW = Number(process.env.VW || 1280);
const ok = (c, m) => { console.log(`[${VW}] ` + (c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: VW, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(p.url() + ' :: ' + m.text().slice(0, 160)); });
  p.on('pageerror', (e) => logs.push('pageerror ' + p.url() + ' ' + e.message));
  p.on('response', (r) => { if (r.status() >= 400) logs.push(`HTTP ${r.status()} ${r.url()}`); });
  let inflight = 0;
  p.on('request', () => inflight++);
  p.on('requestfinished', () => inflight--);
  p.on('requestfailed', () => inflight--);
  const go = async (path) => {
    await p.waitForLoadState('networkidle').catch(() => undefined);
    for (let i = 0; i < 40 && inflight > 0; i++) await p.waitForTimeout(100);
    await p.waitForTimeout(300);
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
  };
  const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const login = async (email, password, next) => {
    await go(`/login/?next=${next}`);
    await p.fill('#login-email', email);
    await p.fill('#login-password', password);
    await p.click('main form button[type=submit]');
    await p.waitForURL(`**${next}`, { timeout: 10000 });
    await p.waitForTimeout(400);
  };
  const logout = async () => {
    await go('/account/');
    await p.click('button:has-text("Sign out")');
    await p.waitForTimeout(300);
  };

  // 1) empty states, signed out
  const empties = [
    ['/', 'home-empty'],
    ['/shop/', 'shop-empty'],
    ['/category/cheats/', 'category-empty'],
    ['/new-releases/', 'new-releases-empty'],
    ['/bundles/', 'bundles-empty'],
    ['/free-files/', 'free-empty'],
    ['/authors/fernhollow/', 'author-empty'],
    ['/product/unavailable/', 'product-unavailable'],
  ];
  for (const [path, id] of empties) {
    await go(path);
    ok((await p.locator(`[data-testid=${id}]`).count()) === 1, `${path} shows its empty state`);
    ok((await p.locator('main article').count()) === 0, `${path} lists no files`);
    ok((await overflow()) <= 0, `${path} has no horizontal overflow`);
  }
  await go('/');
  ok((await p.locator('[aria-roledescription=carousel]').count()) === 0, 'home slider hidden when empty');
  if (process.env.SHOT && VW === 1280) {
    await p.screenshot({ path: process.env.SHOT, fullPage: false });
    console.log('screenshot', process.env.SHOT);
  }
  await go('/shop/?q=canopy');
  ok((await p.locator('main article').count()) === 0, 'search for an old seeded file finds nothing');
  await go('/cart/');
  ok((await p.locator('text=Your cart is empty').count()) === 1, 'cart empty');
  ok((await overflow()) <= 0, '/cart/ no overflow');

  // 2) stale data from the old demo is pruned (cart line, wishlist, order with a seeded file)
  await p.evaluate(() => {
    localStorage.setItem('leafpress-cart', JSON.stringify({ state: { lines: [{ kind: 'product', id: 'p01', license: 'Personal' }, { kind: 'bundle', id: 'starter-garden', license: 'Personal' }], coupon: '' }, version: 0 }));
    localStorage.setItem('leafpress-wishlist', JSON.stringify({ state: { ids: ['p02'] }, version: 0 }));
    localStorage.setItem('leafpress-library', JSON.stringify({ state: { orders: [{ id: 'LP-OLD', items: [{ kind: 'product', id: 'p03', title: 'Old seeded file', license: 'Personal', price: 9, licenseKey: 'K-1', downloads: 0 }], subtotal: 9, discount: 0, tax: 0, total: 9, email: 'demo@leafpress.test', ownerEmail: 'demo@leafpress.test', name: 'Demo', createdAt: '2026-11-01', licenseKeys: ['K-1'] }], freeEmail: '', freeDownloads: { p05: 1 } }, version: 0 }));
  });
  await go('/cart/');
  ok((await p.locator('text=Your cart is empty').count()) === 1, 'old seeded cart lines and bundles pruned');
  const stored = await p.evaluate(() => ({ cart: localStorage.getItem('leafpress-cart'), lib: localStorage.getItem('leafpress-library') }));
  ok(!stored.cart.includes('p01') && !stored.lib.includes('p03') && !stored.lib.includes('p05'), 'pruned data saved back');

  // 3) demo user: library and dashboard are clean
  await login('demo@leafpress.test', 'leafpress', '/library/');
  ok((await p.locator('text=No downloads yet').count()) === 1, 'demo library empty (old order cleared)');
  ok((await overflow()) <= 0, '/library/ no overflow');
  await go('/dashboard/');
  ok((await p.locator('[data-testid=sales-empty]').count()) === 1, 'dashboard shows no demo sales');
  ok((await overflow()) <= 0, '/dashboard/ no overflow');
  await logout();

  // 4) admin panel
  await login('admin@leafpress.local', 'leafpress-admin', '/admin/');
  ok((await p.locator('form[aria-label=Product]').count()) === 1, 'admin product form loads');
  ok((await overflow()) <= 0, '/admin/ no overflow');

  if (VW === 1280) {
    // 5) upload one .dll, see it everywhere, buy and download it as the demo user
    const form = p.locator('form[aria-label=Product]');
    await form.getByLabel('Title', { exact: true }).fill('Hookshot Mod Loader');
    await form.getByLabel('Description', { exact: true }).fill('A small loader DLL for practice servers, with a read-me.');
    await form.getByLabel('Category', { exact: true }).selectOption('cheats');
    await form.getByLabel('Price (USD)', { exact: true }).fill('7');
    await form.getByLabel('Tags (comma separated)').fill('mod, dll');
    await form.getByLabel(/Downloadable file/).setInputFiles('/tmp/hookshot.dll');
    await p.waitForTimeout(200);
    await form.locator('button[type=submit]').click();
    await p.waitForSelector('[data-testid=admin-product]:has-text("Hookshot Mod Loader")', { timeout: 15000 });
    for (const path of ['/', '/shop/', '/category/cheats/', '/new-releases/']) {
      await go(path);
      ok((await p.locator('main article:has-text("Hookshot Mod Loader")').count()) >= 1, `uploaded file listed on ${path}`);
    }
    await go('/');
    ok((await p.locator('[aria-roledescription=carousel]:has-text("Hookshot Mod Loader")').count()) === 1, 'home slider shows the upload');
    await logout();

    await login('demo@leafpress.test', 'leafpress', '/shop/');
    await go('/shop/?q=hookshot');
    await p.locator('main article:has-text("Hookshot") h3 a').first().click();
    await p.waitForURL('**/product/view/?id=adm-*');
    await p.waitForSelector('h1:has-text("Hookshot Mod Loader")');
    await p.click('main button:has-text("Add to cart")');
    await go('/checkout/');
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
  }

  console.log(`[${VW}] console problems:`, logs.length ? logs : 'none');
  if (logs.length) process.exitCode = 1;
  await b.close();
})().catch((e) => { console.error('CRASH', e.message); process.exit(1); });
