import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4173/themes/ubp/verticais', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const el = document.querySelector('.nav-section-title');
  return el ? {
    textContent: el.textContent,
    textTransform: getComputedStyle(el).textTransform,
    htmlTheme: document.documentElement.getAttribute('data-theme'),
    navSectionTransform: getComputedStyle(document.documentElement).getPropertyValue('--nav-section-transform').trim(),
  } : null;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
