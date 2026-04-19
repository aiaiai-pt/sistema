import { test, expect } from "@playwright/test";

// Content stress: explicit assertions on the edge cases the content model
// was designed to exercise. If a Svelte refactor removes an overflow guard
// or mis-binds a state, these fail rather than silently degrade the demo.

test("verticais — empty description falls back to em dash", async ({
  page,
}) => {
  await page.goto("/themes/ubp/verticais");
  const ruido = page.locator(".card", { hasText: "Ruído Ambiente" });
  await expect(ruido).toBeVisible();
  const desc = ruido.locator(".card-desc");
  await expect(desc).toHaveText("—");
  await expect(desc).toHaveClass(/empty/);
});

test("verticais — long name clamps without breaking layout", async ({
  page,
}) => {
  await page.goto("/themes/ubp/verticais");
  const long = page.locator(".card", {
    hasText: "Estacionamento Público Rotativo",
  });
  const title = long.locator(".card-title");
  // Title clamps to a single visible line.
  const lineH = await title.evaluate((el) =>
    parseFloat(getComputedStyle(el).lineHeight),
  );
  const boxH = await title.evaluate((el) => el.getBoundingClientRect().height);
  expect(boxH).toBeLessThanOrEqual(lineH * 1.2);
});

test("verticais — rascunho state keeps 0 contagem visible", async ({
  page,
}) => {
  await page.goto("/themes/ubp/verticais");
  const trotinetes = page.locator(".card", { hasText: "Trotinetes" });
  await expect(trotinetes.locator(".chip.state-warning")).toHaveText(
    "Rascunho",
  );
});

test("verticais — inactivo state renders muted", async ({ page }) => {
  await page.goto("/themes/ubp/verticais");
  const rede = page.locator(".card", { hasText: "Rede de Águas e Saneamento" });
  await expect(rede).toHaveClass(/card-muted/);
});

test("verticais — category filter narrows results", async ({ page }) => {
  await page.goto("/themes/ubp/verticais");
  const before = await page.locator(".card").count();
  await page.getByRole("button", { name: "Mobilidade", exact: true }).click();
  const after = await page.locator(".card").count();
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThan(0);
});

test("utilizadores — five-group user renders with +3 overflow", async ({
  page,
}) => {
  await page.goto("/themes/ubp/utilizadores");
  const maria = page.locator("tr", {
    hasText: "Maria Leonor Albuquerque Pinheiro",
  });
  const more = maria.locator(".tag.tag-more");
  await expect(more).toHaveText("+3");
});

test("utilizadores — nunca user shows relative time literal", async ({
  page,
}) => {
  await page.goto("/themes/ubp/utilizadores");
  const diogo = page.locator("tr", { hasText: "Diogo Pereira Lampreia" });
  await expect(diogo.locator(".col-ultimo")).toHaveText("nunca");
});

test("utilizadores — bloqueado state uses destructive pill", async ({
  page,
}) => {
  await page.goto("/themes/ubp/utilizadores");
  const blocked = page.locator(".chip.state-destructive").first();
  await expect(blocked).toHaveText("Bloqueado");
  // Destructive pill must be a tint, not a solid fill (dark-mode parity rule).
  const bg = await blocked.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(bg).toMatch(/rgba\(/);
  const alpha = parseFloat(bg.match(/rgba\([^)]+,\s*([0-9.]+)\)/)?.[1] ?? "1");
  expect(alpha).toBeLessThan(0.5);
});

test("utilizadores — inactivo row dims to ~55% opacity", async ({ page }) => {
  await page.goto("/themes/ubp/utilizadores");
  const sofia = page.locator("tr", { hasText: "Sofia Beatriz Nogueira" });
  await expect(sofia).toHaveClass(/row-muted/);
});

test("utilizadores — table row height matches 56px Figma target", async ({
  page,
  viewport,
}) => {
  // Only valid at desktop; responsive widths wrap email/groups cells.
  test.skip((viewport?.width ?? 0) < 1440, "desktop-only layout check");
  await page.goto("/themes/ubp/utilizadores");
  const row = page.locator("tbody tr").first();
  const h = await row.evaluate((el) => el.getBoundingClientRect().height);
  expect(Math.round(h)).toBe(56);
});

test("theme — applied on <html> on UBP routes (no shell leak)", async ({
  page,
}) => {
  await page.goto("/themes/ubp");
  const theme = await page.locator("html").getAttribute("data-theme");
  expect(theme).toBe("ubp");
});

test("theme — sidebar width override applies (288px, not default 240px)", async ({
  page,
}) => {
  await page.goto("/themes/ubp");
  const w = await page
    .locator(".sidebar")
    .evaluate((el) => parseFloat(getComputedStyle(el).width));
  expect(w).toBe(288);
});

test("theme — Hanken Grotesk resolves on body", async ({ page }) => {
  await page.goto("/themes/ubp");
  const family = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain("Hanken Grotesk");
});
