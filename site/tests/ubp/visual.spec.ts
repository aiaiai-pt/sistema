import { test, expect } from "@playwright/test";

// Visual regression for the UBP dark theme. Baselines live in
// tests/ubp/__snapshots__/ and are committed to git. Any token/CSS change
// that produces a visual diff above the threshold fails the build, forcing
// a conscious -u (update-snapshots) acknowledgement.

const pages = [
  { name: "landing", path: "/themes/ubp" },
  { name: "verticais", path: "/themes/ubp/verticais" },
  { name: "utilizadores", path: "/themes/ubp/utilizadores" },
];

for (const p of pages) {
  test(`${p.name} — visual snapshot`, async ({ page }) => {
    await page.goto(p.path);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    // Give CSS transitions a tick to settle.
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      fullPage: true,
    });
  });
}
