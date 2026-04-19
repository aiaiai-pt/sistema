import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// WCAG 2.1 AA scan for every UBP surface. First dark theme in the system,
// so contrast on text-secondary / accent-subtle / status-pill is the main
// risk. Any violation at or above "serious" fails the build.

const routes = [
  { name: "landing", path: "/themes/ubp" },
  { name: "verticais", path: "/themes/ubp/verticais" },
  { name: "utilizadores", path: "/themes/ubp/utilizadores" },
];

for (const r of routes) {
  test(`${r.name} — axe WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(r.path);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    // Attach the full report to the test result so CI can surface it.
    if (results.violations.length > 0) {
      await test.info().attach(`${r.name}-axe.json`, {
        body: JSON.stringify(results.violations, null, 2),
        contentType: "application/json",
      });
    }

    expect(blocking, `Blocking a11y violations on ${r.name}`).toEqual([]);
  });
}
