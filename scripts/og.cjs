// Rasterises scripts/og.svg (drawn in code) to public/og.png (1200x630) for Open Graph cards.
// Usage: CHROMIUM=/path/to/chrome node scripts/og.cjs   (needs playwright-core; set PLAYWRIGHT_CORE to its path if not installed here)
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const { readFileSync } = require('node:fs');
const path = require('node:path');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<body style="margin:0">${readFileSync(path.join(__dirname, 'og.svg'), 'utf8')}</body>`);
  await p.screenshot({ path: path.join(__dirname, '..', 'public', 'og.png') });
  await b.close();
})();
