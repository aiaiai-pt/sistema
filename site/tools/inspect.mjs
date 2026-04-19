import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/themes/ubp/utilizadores', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const info = await page.evaluate(() => {
  const bloq = [...document.querySelectorAll('.chip.state-destructive')][0];
  const activo = [...document.querySelectorAll('.chip.state-success')][0];
  const avatars = [...document.querySelectorAll('.avatar')].slice(0, 3);
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    bloq: bloq && { text: bloq.textContent, bg: getComputedStyle(bloq).backgroundColor, fg: getComputedStyle(bloq).color },
    activo: activo && { bg: getComputedStyle(activo).backgroundColor, fg: getComputedStyle(activo).color },
    avatars: avatars.map(a => ({ text: a.textContent, bg: getComputedStyle(a).backgroundColor })),
    sidebarWidth: getComputedStyle(document.querySelector('.sidebar')).width,
    accentSubtle: getComputedStyle(document.documentElement).getPropertyValue('--color-accent-subtle').trim(),
    destructiveSubtle: getComputedStyle(document.documentElement).getPropertyValue('--color-destructive-subtle').trim(),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
