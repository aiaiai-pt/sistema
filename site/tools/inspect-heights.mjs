import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/themes/ubp/utilizadores', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const info = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('tbody tr')].slice(0, 3);
  const cards = [...document.querySelectorAll('.page-card')].slice(0, 2);
  return {
    rowHeights: rows.map(r => r.getBoundingClientRect().height),
    rowComputedHeight: rows[0] && getComputedStyle(rows[0].querySelector('td')).height,
    bodyFont: getComputedStyle(document.body).fontFamily,
    h1Font: (() => { const el = document.querySelector('h1,.ubp-display,.type-display,.type-heading-lg'); return el ? getComputedStyle(el).fontFamily : null; })(),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
