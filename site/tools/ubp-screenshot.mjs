import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] || '/tmp/ubp-shots';
mkdirSync(outDir, { recursive: true });

const base = process.env.UBP_BASE || 'http://localhost:5173';
const pages = [
  ['landing', '/themes/ubp'],
  ['verticais', '/themes/ubp/verticais'],
  ['utilizadores', '/themes/ubp/utilizadores'],
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

const page = await context.newPage();
for (const [name, path] of pages) {
  const url = base + path;
  console.log(`→ ${name} ${url}`);
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  console.log(`  status: ${resp?.status()}`);
  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  // Small pause for transitions
  await page.waitForTimeout(300);
  const out = join(outDir, `${name}.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`  saved ${out}`);
}

await browser.close();
