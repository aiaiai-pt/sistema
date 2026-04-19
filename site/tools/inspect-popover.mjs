import { chromium } from 'playwright';

const URL = process.env.UBP_BASE || 'https://aiaiai-noescuro.netlify.app';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// 1. Force UBP theme via cookie before navigation (prod has no /themes/ubp for menu)
await page.context().addCookies([{
  name: 'theme', value: 'ubp', domain: new URL(URL).hostname, path: '/',
}]);

await page.goto(`${URL}/components/menu`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Confirm theme active
const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log('theme on html:', theme);

// Try to find a trigger that opens a popover/menu
const triggers = await page.locator('button').all();
console.log(`found ${triggers.length} buttons`);

// Click the first button that looks like a menu trigger by text (heuristic)
const candidates = ['Open menu', 'Options', 'Menu', 'More', 'Actions'];
let opened = false;
for (const t of triggers) {
  const txt = (await t.textContent())?.trim() ?? '';
  if (candidates.some(c => txt.includes(c)) || txt.endsWith('▾') || txt.endsWith('⌄')) {
    await t.click().catch(() => {});
    opened = true;
    console.log('clicked:', txt);
    break;
  }
}
if (!opened && triggers.length > 0) {
  // Just click the first button inside main demo area
  await triggers[Math.min(5, triggers.length - 1)].click().catch(() => {});
  console.log('fallback-clicked button index 5');
}

await page.waitForTimeout(600);

// Find any popover/menu element on the page
const info = await page.evaluate(() => {
  const selectors = ['[role="menu"]', '[data-popover]', '.popover', '[class*="popover"]', '[class*="menu"][aria-expanded]', '[class*="Popover"]'];
  const found = [];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        found.push({
          selector: sel,
          tag: el.tagName,
          classes: el.className.toString().slice(0, 120),
          bg: cs.backgroundColor,
          color: cs.color,
          border: cs.border,
          boxShadow: cs.boxShadow.slice(0, 80),
          rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
        });
      }
    }
  }
  return {
    vars: {
      popoverBg: getComputedStyle(document.documentElement).getPropertyValue('--popover-bg').trim(),
      colorSurface: getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
      menuBg: getComputedStyle(document.documentElement).getPropertyValue('--menu-bg').trim(),
      menuItemColor: getComputedStyle(document.documentElement).getPropertyValue('--menu-item-color').trim(),
    },
    found,
  };
});
console.log(JSON.stringify(info, null, 2));

await page.screenshot({ path: '/tmp/ubp-popover-prod.png', fullPage: false });
console.log('screenshot: /tmp/ubp-popover-prod.png');

await browser.close();
